import {
  allowResponse,
  assertNotRateLimited,
  clearCookieHeader,
  clearFailedAuthAttempts,
  cookieHeader,
  createSession,
  hashPassword,
  isValidEmail,
  json,
  loadSessionUser,
  normalizeEmail,
  randomToken,
  registerFailedAuthAttempt,
  revokeSessionFromRequest,
  verifyPassword,
  withRetryAfter,
} from "../../_shared/auth";

const DEMO_HASH = "pbkdf2_sha256$100000$demo-salt$2CLhx9uLaWAsOi5xT6osbyvK7x4eQ6W05rfg5joWLe0";
const REGISTER_SCOPE = "register";
const LOGIN_SCOPE = "login";

const parseBody = async (request) => {
  try {
    return await request.json();
  } catch {
    return null;
  }
};

const getDb = (env) => env.AUTH_DB || env.DB || null;

const logAuthEvent = async (db, event, userId, request) => {
  const ip =
    request.headers.get("cf-connecting-ip") ||
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    "unknown";
  await db
    .prepare("INSERT INTO auth_audit (id, user_id, event, ip, created_at) VALUES (?, ?, ?, ?, ?)")
    .bind(randomToken(12), userId || null, event, ip, Date.now())
    .run();
};

const validatePassword = (value) => typeof value === "string" && value.length >= 8 && value.length <= 128;

const safeAuthError = () =>
  json(
    {
      status: false,
      error: "Invalid credentials.",
    },
    { status: 401 },
  );

const safeRegisterError = () =>
  json(
    {
      status: false,
      error: "Unable to create account.",
    },
    { status: 400 },
  );

const handleSession = async (request, env) => {
  const db = getDb(env);
  if (!db) {
    return json({ status: false, error: "Auth database is not configured." }, { status: 500 });
  }
  const session = await loadSessionUser(db, request);
  if (!session) return json({ status: true, authenticated: false, user: null });
  return json({
    status: true,
    authenticated: true,
    user: {
      id: session.user.id,
      email: session.user.email,
      name: session.user.name,
    },
  });
};

const handleRegister = async (request, env) => {
  const db = getDb(env);
  if (!db) return json({ status: false, error: "Auth database is not configured." }, { status: 500 });

  const payload = await parseBody(request);
  if (!payload) return safeRegisterError();

  const name = typeof payload.name === "string" ? payload.name.trim() : "";
  const email = typeof payload.email === "string" ? normalizeEmail(payload.email) : "";
  const password = typeof payload.password === "string" ? payload.password : "";

  if (!name || name.length > 100 || !email || email.length > 320 || !isValidEmail(email) || !validatePassword(password)) {
    return safeRegisterError();
  }

  const rate = await assertNotRateLimited(db, request, email, REGISTER_SCOPE);
  if (rate.blocked) {
    return json(
      { status: false, error: "Too many attempts. Please try again later." },
      { status: 429, headers: withRetryAfter(rate.retryAfter) },
    );
  }

  const exists = await db.prepare("SELECT id FROM users WHERE email = ?").bind(email).first();
  if (exists) {
    await registerFailedAuthAttempt(db, request, email, REGISTER_SCOPE);
    await logAuthEvent(db, "register_failed_exists", null, request);
    return safeRegisterError();
  }

  const passwordHash = await hashPassword(password);
  const userId = randomToken(12);
  const now = Date.now();

  await db
    .prepare("INSERT INTO users (id, email, name, password_hash, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)")
    .bind(userId, email, name, passwordHash, now, now)
    .run();

  const session = await createSession(db, userId);
  await clearFailedAuthAttempts(db, request, email, REGISTER_SCOPE);
  await logAuthEvent(db, "register_success", userId, request);

  return json(
    {
      status: true,
      user: { id: userId, email, name },
    },
    {
      headers: {
        "set-cookie": cookieHeader(session.token),
      },
    },
  );
};

const handleLogin = async (request, env) => {
  const db = getDb(env);
  if (!db) return json({ status: false, error: "Auth database is not configured." }, { status: 500 });

  const payload = await parseBody(request);
  if (!payload) return safeAuthError();

  const email = typeof payload.email === "string" ? normalizeEmail(payload.email) : "";
  const password = typeof payload.password === "string" ? payload.password : "";
  if (!email || !password) return safeAuthError();

  const rate = await assertNotRateLimited(db, request, email, LOGIN_SCOPE);
  if (rate.blocked) {
    return json(
      { status: false, error: "Too many attempts. Please try again later." },
      { status: 429, headers: withRetryAfter(rate.retryAfter) },
    );
  }

  const user = await db
    .prepare("SELECT id, email, name, password_hash FROM users WHERE email = ?")
    .bind(email)
    .first();

  if (!user) {
    await verifyPassword(password, DEMO_HASH);
    await registerFailedAuthAttempt(db, request, email, LOGIN_SCOPE);
    await logAuthEvent(db, "login_failed_unknown", null, request);
    return safeAuthError();
  }

  const validPassword = await verifyPassword(password, user.password_hash);
  if (!validPassword) {
    await registerFailedAuthAttempt(db, request, email, LOGIN_SCOPE);
    await logAuthEvent(db, "login_failed_bad_password", user.id, request);
    return safeAuthError();
  }

  const session = await createSession(db, user.id);
  await clearFailedAuthAttempts(db, request, email, LOGIN_SCOPE);
  await logAuthEvent(db, "login_success", user.id, request);

  return json(
    {
      status: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
    },
    {
      headers: {
        "set-cookie": cookieHeader(session.token),
      },
    },
  );
};

const handleLogout = async (request, env) => {
  const db = getDb(env);
  if (!db) {
    return json(
      { status: true },
      {
        headers: {
          "set-cookie": clearCookieHeader(),
        },
      },
    );
  }
  const session = await loadSessionUser(db, request);
  await revokeSessionFromRequest(db, request);
  await logAuthEvent(db, "logout", session?.user?.id ?? null, request);

  return json(
    { status: true },
    {
      headers: {
        "set-cookie": clearCookieHeader(),
      },
    },
  );
};

export async function onRequest(context) {
  try {
    const method = context.request.method.toUpperCase();
    const path = Array.isArray(context.params.path)
      ? context.params.path.filter(Boolean).join("/")
      : typeof context.params.path === "string"
        ? context.params.path
        : "";

    if (method === "OPTIONS") {
      return allowResponse("GET, POST, OPTIONS");
    }

    if (method === "GET" && (path === "" || path === "session")) {
      return handleSession(context.request, context.env);
    }

    if (method === "POST" && path === "register") {
      return handleRegister(context.request, context.env);
    }

    if (method === "POST" && path === "login") {
      return handleLogin(context.request, context.env);
    }

    if (method === "POST" && path === "logout") {
      return handleLogout(context.request, context.env);
    }

    return json({ status: false, error: "Method or path not allowed." }, { status: 405 });
  } catch (error) {
    console.error("auth_endpoint_failed", error);
    return json(
      {
        status: false,
        error: "Auth endpoint failed.",
      },
      { status: 500 },
    );
  }
}
