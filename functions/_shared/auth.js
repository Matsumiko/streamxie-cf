const SESSION_COOKIE = "sx_session";
const SESSION_TTL_SECONDS = 60 * 60 * 24 * 30;
const PASSWORD_ITERATIONS = 100_000;
const STRICT_TRANSPORT_SECURITY = "max-age=31536000; includeSubDomains";

const encoder = new TextEncoder();

export const securityHeaders = () => ({
  "x-content-type-options": "nosniff",
  "x-frame-options": "DENY",
  "referrer-policy": "strict-origin-when-cross-origin",
  "permissions-policy": "camera=(), microphone=(), geolocation=()",
  "strict-transport-security": STRICT_TRANSPORT_SECURITY,
});

export const json = (payload, init = {}) =>
  new Response(JSON.stringify(payload), {
    ...init,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store",
      ...securityHeaders(),
      ...(init.headers ?? {}),
    },
  });

export const allowResponse = (allowValue) =>
  new Response(null, {
    status: 204,
    headers: {
      allow: allowValue,
      ...securityHeaders(),
      "cache-control": "no-store",
    },
  });

export const withRetryAfter = (retryAfterSeconds) => ({
  "retry-after": String(Math.max(1, Number(retryAfterSeconds) || 1)),
});

export const toBase64Url = (bytes) =>
  btoa(String.fromCharCode(...bytes))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");

const randomBytes = (length) => {
  const bytes = new Uint8Array(length);
  crypto.getRandomValues(bytes);
  return bytes;
};

export const randomToken = (length = 32) => toBase64Url(randomBytes(length));

export const sha256Hex = async (value) => {
  const buffer = await crypto.subtle.digest("SHA-256", encoder.encode(value));
  const bytes = new Uint8Array(buffer);
  return [...bytes].map((byte) => byte.toString(16).padStart(2, "0")).join("");
};

export const normalizeEmail = (value) => value.trim().toLowerCase();

export const isValidEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

const derivePbkdf2Bits = async (password, salt, iterations = PASSWORD_ITERATIONS) => {
  const key = await crypto.subtle.importKey("raw", encoder.encode(password), "PBKDF2", false, ["deriveBits"]);
  return crypto.subtle.deriveBits(
    {
      name: "PBKDF2",
      hash: "SHA-256",
      salt: encoder.encode(salt),
      iterations,
    },
    key,
    256,
  );
};

export const hashPassword = async (password) => {
  const salt = randomToken(16);
  const bits = await derivePbkdf2Bits(password, salt, PASSWORD_ITERATIONS);
  const hash = toBase64Url(new Uint8Array(bits));
  return `pbkdf2_sha256$${PASSWORD_ITERATIONS}$${salt}$${hash}`;
};

export const verifyPassword = async (password, encodedHash) => {
  const [algo, iterationRaw, salt, storedHash] = String(encodedHash).split("$");
  if (algo !== "pbkdf2_sha256" || !iterationRaw || !salt || !storedHash) return false;
  const iterations = Number(iterationRaw);
  if (!Number.isInteger(iterations) || iterations < 60_000) return false;
  const bits = await derivePbkdf2Bits(password, salt, iterations);
  const computed = toBase64Url(new Uint8Array(bits));
  if (computed.length !== storedHash.length) return false;
  let mismatch = 0;
  for (let i = 0; i < computed.length; i += 1) {
    mismatch |= computed.charCodeAt(i) ^ storedHash.charCodeAt(i);
  }
  return mismatch === 0;
};

export const cookieHeader = (token, maxAgeSeconds = SESSION_TTL_SECONDS) =>
  `${SESSION_COOKIE}=${token}; Max-Age=${maxAgeSeconds}; Path=/; HttpOnly; Secure; SameSite=Lax`;

export const clearCookieHeader = () =>
  `${SESSION_COOKIE}=; Max-Age=0; Path=/; HttpOnly; Secure; SameSite=Lax`;

export const getSessionTokenFromCookie = (cookieHeaderValue) => {
  if (!cookieHeaderValue) return "";
  const parts = cookieHeaderValue.split(";").map((part) => part.trim());
  const found = parts.find((part) => part.startsWith(`${SESSION_COOKIE}=`));
  return found ? found.slice(SESSION_COOKIE.length + 1) : "";
};

const getIp = (request) =>
  request.headers.get("cf-connecting-ip") ||
  request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
  "unknown";

const scopedEmailRateKey = async (request, email, scope) => {
  const ip = getIp(request);
  return `email:${scope}:${ip}:${await sha256Hex(email)}`;
};

const scopedIpRateKey = (request, scope) => `ip:${scope}:${getIp(request)}`;

const getAttemptRecord = async (db, key) => {
  const row = await db
    .prepare("SELECT fails, window_started_at, lock_until FROM auth_attempts WHERE key = ?")
    .bind(key)
    .first();
  return row || null;
};

export const assertNotRateLimited = async (db, request, email, scope = "auth") => {
  const emailKey = await scopedEmailRateKey(request, email, scope);
  const ipKey = scopedIpRateKey(request, scope);
  const now = Date.now();
  const [emailRecord, ipRecord] = await Promise.all([getAttemptRecord(db, emailKey), getAttemptRecord(db, ipKey)]);
  const emailLockUntil = Number(emailRecord?.lock_until || 0);
  const ipLockUntil = Number(ipRecord?.lock_until || 0);
  const lockUntil = Math.max(emailLockUntil, ipLockUntil);
  if (lockUntil > now) {
    return { blocked: true, retryAfter: Math.ceil((lockUntil - now) / 1000) };
  }
  return { blocked: false };
};

const upsertAttempt = async (db, key, maxFailsBeforeLock) => {
  const now = Date.now();
  const windowMs = 15 * 60 * 1000;
  const lockMs = 15 * 60 * 1000;
  const current = await getAttemptRecord(db, key);
  const isSameWindow = current && now - Number(current.window_started_at || 0) < windowMs;
  const fails = isSameWindow ? Number(current.fails || 0) + 1 : 1;
  const lockUntil = fails >= maxFailsBeforeLock ? now + lockMs : 0;
  const startedAt = isSameWindow ? Number(current.window_started_at || now) : now;

  await db
    .prepare(
      `INSERT INTO auth_attempts (key, fails, window_started_at, lock_until)
       VALUES (?, ?, ?, ?)
       ON CONFLICT(key) DO UPDATE SET fails=excluded.fails, window_started_at=excluded.window_started_at, lock_until=excluded.lock_until`,
    )
    .bind(key, fails, startedAt, lockUntil)
    .run();
};

export const registerFailedAuthAttempt = async (db, request, email, scope = "auth") => {
  const emailKey = await scopedEmailRateKey(request, email, scope);
  const ipKey = scopedIpRateKey(request, scope);
  await Promise.all([upsertAttempt(db, emailKey, 10), upsertAttempt(db, ipKey, 25)]);
};

export const clearFailedAuthAttempts = async (db, request, email, scope = "auth") => {
  const emailKey = await scopedEmailRateKey(request, email, scope);
  await db.prepare("DELETE FROM auth_attempts WHERE key = ?").bind(emailKey).run();
};

export const createSession = async (db, userId) => {
  const token = randomToken(32);
  const tokenHash = await sha256Hex(token);
  const sessionId = randomToken(16);
  const now = Date.now();
  const expiresAt = now + SESSION_TTL_SECONDS * 1000;

  await db
    .prepare(
      `INSERT INTO sessions (id, user_id, token_hash, created_at, expires_at, last_seen_at, revoked_at)
       VALUES (?, ?, ?, ?, ?, ?, NULL)`,
    )
    .bind(sessionId, userId, tokenHash, now, expiresAt, now)
    .run();

  return { token, expiresAt };
};

export const loadSessionUser = async (db, request) => {
  const token = getSessionTokenFromCookie(request.headers.get("cookie"));
  if (!token) return null;
  const tokenHash = await sha256Hex(token);
  const now = Date.now();
  const row = await db
    .prepare(
      `SELECT s.id AS session_id, s.user_id, s.expires_at, s.revoked_at,
              u.id AS user_id_ref, u.email, u.name
       FROM sessions s
       JOIN users u ON u.id = s.user_id
       WHERE s.token_hash = ?`,
    )
    .bind(tokenHash)
    .first();

  if (!row) return null;
  if (Number(row.revoked_at || 0) > 0 || Number(row.expires_at || 0) <= now) return null;

  await db.prepare("UPDATE sessions SET last_seen_at = ? WHERE id = ?").bind(now, row.session_id).run();

  return {
    sessionId: row.session_id,
    user: {
      id: row.user_id,
      email: row.email,
      name: row.name,
    },
  };
};

export const revokeSessionFromRequest = async (db, request) => {
  const token = getSessionTokenFromCookie(request.headers.get("cookie"));
  if (!token) return;
  const tokenHash = await sha256Hex(token);
  await db
    .prepare("UPDATE sessions SET revoked_at = ? WHERE token_hash = ? AND revoked_at IS NULL")
    .bind(Date.now(), tokenHash)
    .run();
};
