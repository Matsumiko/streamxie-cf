import { allowResponse, json, loadSessionUser } from "../../_shared/auth";
import { createTurso, defaultState, getUserState, normalizeStatePayload, saveUserState, tursoUnavailable } from "../../_shared/turso";

const getDb = (env) => env.AUTH_DB || env.DB || null;

const requireAuth = async (request, env) => {
  const db = getDb(env);
  if (!db) {
    return {
      error: json({ status: false, error: "Auth database is not configured." }, { status: 500 }),
    };
  }
  const session = await loadSessionUser(db, request);
  if (!session) {
    return {
      error: json({ status: false, error: "Unauthorized." }, { status: 401 }),
    };
  }
  return { session };
};

const parseBody = async (request) => {
  try {
    return await request.json();
  } catch {
    return null;
  }
};

const mergeState = (base, patch) => {
  const merged = {
    ...base,
    ...(patch || {}),
  };
  if (patch && Object.prototype.hasOwnProperty.call(patch, "watchProgress")) {
    merged.watchProgress = patch.watchProgress;
  }
  if (patch && Object.prototype.hasOwnProperty.call(patch, "myList")) {
    merged.myList = patch.myList;
  }
  if (patch && Object.prototype.hasOwnProperty.call(patch, "searchHistory")) {
    merged.searchHistory = patch.searchHistory;
  }
  if (patch && Object.prototype.hasOwnProperty.call(patch, "avatarId")) {
    merged.avatarId = patch.avatarId;
  }
  return normalizeStatePayload(merged);
};

export async function onRequest(context) {
  const method = context.request.method.toUpperCase();
  if (method === "OPTIONS") {
    return allowResponse("GET, PUT, PATCH, OPTIONS");
  }

  const auth = await requireAuth(context.request, context.env);
  if (auth.error) return auth.error;

  const turso = createTurso(context.env);
  if (!turso) return tursoUnavailable();

  const userId = auth.session.user.id;

  if (method === "GET") {
    const state = await getUserState(turso, userId);
    return json({
      status: true,
      state,
    });
  }

  if (method === "PUT" || method === "PATCH") {
    const payload = await parseBody(context.request);
    if (!payload || typeof payload !== "object") {
      return json({ status: false, error: "Invalid payload." }, { status: 400 });
    }

    const current = await getUserState(turso, userId);
    const next = method === "PUT" ? normalizeStatePayload(payload) : mergeState(current, payload);
    const saved = await saveUserState(turso, userId, next);
    return json({
      status: true,
      state: saved,
    });
  }

  return json(
    {
      status: false,
      error: "Method not allowed.",
    },
    { status: 405 },
  );
}
