import { migrateLocalStorageKey } from "@/lib/storageKeys";
import { fetchAccountState, patchAccountState } from "@/lib/account-api";

export type WatchProgressEntry = {
  contentId: string;
  episodeId?: string;
  progress: number;
  duration: number;
  updatedAt: number;
};

export const WATCH_PROGRESS_UPDATED_EVENT = "streamxie:watch-progress-updated";

const MY_LIST_KEY = "streamxie-my-list";
const WATCH_PROGRESS_KEY = "streamxie-watch-progress";
const SEARCH_HISTORY_KEY = "streamxie-search-history";

const LEGACY_MY_LIST_KEY = "streamora-my-list";
const LEGACY_WATCH_PROGRESS_KEY = "streamora-watch-progress";
const LEGACY_SEARCH_HISTORY_KEY = "streamora-search-history";
const AVATAR_KEY = "streamxie-avatar";
const LEGACY_AVATAR_KEY = "streamora-avatar";
const AUTH_USER_KEY = "streamxie-auth-user";
const LEGACY_AUTH_USER_KEY = "streamora-auth-user";

let pendingSyncTimer: number | null = null;
let pendingPatch: Partial<AccountStateSnapshot> = {};
let lastWatchSyncAt = 0;

const migrateStorage = () => {
  migrateLocalStorageKey(MY_LIST_KEY, LEGACY_MY_LIST_KEY);
  migrateLocalStorageKey(WATCH_PROGRESS_KEY, LEGACY_WATCH_PROGRESS_KEY);
  migrateLocalStorageKey(SEARCH_HISTORY_KEY, LEGACY_SEARCH_HISTORY_KEY);
  migrateLocalStorageKey(AVATAR_KEY, LEGACY_AVATAR_KEY);
};

type AccountStateSnapshot = {
  myList: string[];
  watchProgress: Record<string, WatchProgressEntry>;
  searchHistory: string[];
  avatarId: string | null;
};

const hasAuthenticatedUser = () => {
  try {
    migrateLocalStorageKey(AUTH_USER_KEY, LEGACY_AUTH_USER_KEY);
    const raw = localStorage.getItem(AUTH_USER_KEY);
    if (!raw) return false;
    const parsed = JSON.parse(raw);
    return Boolean(parsed?.name);
  } catch {
    return false;
  }
};

const flushAccountPatch = async () => {
  const patch = pendingPatch;
  pendingPatch = {};
  pendingSyncTimer = null;
  if (Object.keys(patch).length === 0) return;
  // Jangan kirim sinkronisasi akun jika sesi lokal sudah tidak ada (anon/logout).
  if (!hasAuthenticatedUser()) return;
  try {
    await patchAccountState(patch);
  } catch {
    // Intentionally ignore network/auth failures for local-first UX.
  }
};

const enqueueAccountPatch = (patch: Partial<AccountStateSnapshot>) => {
  if (!hasAuthenticatedUser()) return;
  pendingPatch = { ...pendingPatch, ...patch };
  if (pendingSyncTimer) window.clearTimeout(pendingSyncTimer);
  pendingSyncTimer = window.setTimeout(() => {
    void flushAccountPatch();
  }, 1200);
};

const emitWatchProgressUpdated = () => {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(WATCH_PROGRESS_UPDATED_EVENT));
};

export const getMyList = (): string[] => {
  try {
    migrateStorage();
    const raw = localStorage.getItem(MY_LIST_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

export const toggleMyList = (id: string): string[] => {
  const current = getMyList();
  const next = current.includes(id)
    ? current.filter((item) => item !== id)
    : [...current, id];
  localStorage.setItem(MY_LIST_KEY, JSON.stringify(next));
  enqueueAccountPatch({ myList: next });
  return next;
};

export const getWatchProgress = (): Record<string, WatchProgressEntry> => {
  try {
    migrateStorage();
    const raw = localStorage.getItem(WATCH_PROGRESS_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
};

export const saveWatchProgress = (entry: WatchProgressEntry) => {
  const current = getWatchProgress();
  current[entry.contentId] = entry;
  localStorage.setItem(WATCH_PROGRESS_KEY, JSON.stringify(current));
  emitWatchProgressUpdated();
  const now = Date.now();
  const shouldSync = now - lastWatchSyncAt > 15_000 || entry.progress >= 98;
  if (shouldSync) {
    lastWatchSyncAt = now;
    enqueueAccountPatch({ watchProgress: current });
  }
};

export const getSearchHistory = (): string[] => {
  try {
    migrateStorage();
    const raw = localStorage.getItem(SEARCH_HISTORY_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

export const saveSearchTerm = (term: string) => {
  const current = getSearchHistory().filter(
    (item) => item.toLowerCase() !== term.toLowerCase(),
  );
  const next = [term, ...current].slice(0, 6);
  localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(next));
  enqueueAccountPatch({ searchHistory: next });
  return next;
};

export const getLocalAccountSnapshot = (): AccountStateSnapshot => {
  migrateStorage();
  const avatar = localStorage.getItem(AVATAR_KEY);
  return {
    myList: getMyList(),
    watchProgress: getWatchProgress(),
    searchHistory: getSearchHistory(),
    avatarId: avatar || null,
  };
};

export const applyAccountSnapshot = (snapshot: Partial<AccountStateSnapshot>) => {
  migrateStorage();
  if (snapshot.myList) localStorage.setItem(MY_LIST_KEY, JSON.stringify(snapshot.myList));
  if (snapshot.watchProgress) {
    localStorage.setItem(WATCH_PROGRESS_KEY, JSON.stringify(snapshot.watchProgress));
    emitWatchProgressUpdated();
  }
  if (snapshot.searchHistory) localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(snapshot.searchHistory));
  if (Object.prototype.hasOwnProperty.call(snapshot, "avatarId")) {
    if (snapshot.avatarId) localStorage.setItem(AVATAR_KEY, snapshot.avatarId);
    else localStorage.removeItem(AVATAR_KEY);
  }
  window.dispatchEvent(new Event("storage"));
};

export const applyRemoteAccountState = async () => {
  const remote = await fetchAccountState();
  if (!remote) return false;
  applyAccountSnapshot(remote);
  return true;
};
