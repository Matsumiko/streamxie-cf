-- streamXie user state schema (Turso)

CREATE TABLE IF NOT EXISTS user_state (
  user_id TEXT PRIMARY KEY,
  my_list_json TEXT NOT NULL DEFAULT '[]',
  watch_progress_json TEXT NOT NULL DEFAULT '{}',
  search_history_json TEXT NOT NULL DEFAULT '[]',
  avatar_id TEXT,
  updated_at INTEGER NOT NULL
);
