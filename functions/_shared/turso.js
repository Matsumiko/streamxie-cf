import { createClient } from "@libsql/client/web";

const json = (payload, init = {}) =>
  new Response(JSON.stringify(payload), {
    ...init,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store",
      "x-content-type-options": "nosniff",
      ...(init.headers ?? {}),
    },
  });

export const createTurso = (env) => {
  const url = env.TURSO_URL;
  const authToken = env.TURSO_TOKEN;
  if (!url || !authToken) return null;
  return createClient({ url, authToken });
};

export const ensureUserStateTable = async (client) => {
  await client.execute(`
    CREATE TABLE IF NOT EXISTS user_state (
      user_id TEXT PRIMARY KEY,
      my_list_json TEXT NOT NULL DEFAULT '[]',
      watch_progress_json TEXT NOT NULL DEFAULT '{}',
      search_history_json TEXT NOT NULL DEFAULT '[]',
      avatar_id TEXT,
      updated_at INTEGER NOT NULL
    )
  `);
};

export const defaultState = () => ({
  myList: [],
  watchProgress: {},
  searchHistory: [],
  avatarId: null,
  updatedAt: Date.now(),
});

export const normalizeStatePayload = (payload) => {
  const safe = defaultState();
  if (!payload || typeof payload !== "object") return safe;

  if (Array.isArray(payload.myList)) {
    safe.myList = payload.myList
      .filter((value) => typeof value === "string")
      .map((value) => value.trim())
      .filter(Boolean)
      .slice(0, 1000);
  }

  if (payload.watchProgress && typeof payload.watchProgress === "object") {
    const entries = Object.entries(payload.watchProgress).slice(0, 5000);
    const normalized = {};
    for (const [key, value] of entries) {
      if (!key || typeof value !== "object" || !value) continue;
      const progress = Number(value.progress || 0);
      const duration = Number(value.duration || 0);
      const updatedAt = Number(value.updatedAt || Date.now());
      normalized[key] = {
        contentId: typeof value.contentId === "string" ? value.contentId : key,
        episodeId: typeof value.episodeId === "string" ? value.episodeId : undefined,
        progress: Number.isFinite(progress) ? Math.max(0, Math.min(100, progress)) : 0,
        duration: Number.isFinite(duration) ? Math.max(0, duration) : 0,
        updatedAt: Number.isFinite(updatedAt) ? updatedAt : Date.now(),
      };
    }
    safe.watchProgress = normalized;
  }

  if (Array.isArray(payload.searchHistory)) {
    safe.searchHistory = payload.searchHistory
      .filter((value) => typeof value === "string")
      .map((value) => value.trim())
      .filter(Boolean)
      .slice(0, 20);
  }

  safe.avatarId = typeof payload.avatarId === "string" && payload.avatarId.trim() ? payload.avatarId.trim() : null;
  safe.updatedAt = Date.now();
  return safe;
};

export const getUserState = async (client, userId) => {
  await ensureUserStateTable(client);
  const rowResult = await client.execute({
    sql: `SELECT my_list_json, watch_progress_json, search_history_json, avatar_id, updated_at
          FROM user_state WHERE user_id = ?`,
    args: [userId],
  });
  const row = rowResult.rows?.[0];
  if (!row) return defaultState();

  return {
    myList: JSON.parse(String(row.my_list_json || "[]")),
    watchProgress: JSON.parse(String(row.watch_progress_json || "{}")),
    searchHistory: JSON.parse(String(row.search_history_json || "[]")),
    avatarId: row.avatar_id ? String(row.avatar_id) : null,
    updatedAt: Number(row.updated_at || Date.now()),
  };
};

export const saveUserState = async (client, userId, nextState) => {
  const normalized = normalizeStatePayload(nextState);
  await ensureUserStateTable(client);
  await client.execute({
    sql: `INSERT INTO user_state (user_id, my_list_json, watch_progress_json, search_history_json, avatar_id, updated_at)
          VALUES (?, ?, ?, ?, ?, ?)
          ON CONFLICT(user_id) DO UPDATE SET
            my_list_json = excluded.my_list_json,
            watch_progress_json = excluded.watch_progress_json,
            search_history_json = excluded.search_history_json,
            avatar_id = excluded.avatar_id,
            updated_at = excluded.updated_at`,
    args: [
      userId,
      JSON.stringify(normalized.myList),
      JSON.stringify(normalized.watchProgress),
      JSON.stringify(normalized.searchHistory),
      normalized.avatarId,
      normalized.updatedAt,
    ],
  });
  return normalized;
};

export const tursoUnavailable = () =>
  json(
    {
      status: false,
      error: "User data store is not configured.",
    },
    { status: 500 },
  );
