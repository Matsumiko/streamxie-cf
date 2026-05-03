import type { DemoUser } from "@/hooks/use-auth";
import type { WatchProgressEntry } from "@/lib/storage";

export type AccountStatePayload = {
  myList: string[];
  watchProgress: Record<string, WatchProgressEntry>;
  searchHistory: string[];
  avatarId: string | null;
};

const requestJson = async (url: string, init?: RequestInit) => {
  const response = await fetch(url, {
    credentials: "same-origin",
    ...init,
    headers: {
      "content-type": "application/json",
      ...(init?.headers ?? {}),
    },
  });
  let payload: any = null;
  try {
    payload = await response.json();
  } catch {
    payload = null;
  }
  return { response, payload };
};

export const registerAccount = async (input: { name: string; email: string; password: string }) => {
  const { response, payload } = await requestJson("/api/auth/register", {
    method: "POST",
    body: JSON.stringify(input),
  });
  if (!response.ok || !payload?.user) {
    throw new Error(payload?.error || "Unable to create account.");
  }
  return payload.user as DemoUser;
};

export const loginAccount = async (input: { email: string; password: string }) => {
  const { response, payload } = await requestJson("/api/auth/login", {
    method: "POST",
    body: JSON.stringify(input),
  });
  if (!response.ok || !payload?.user) {
    throw new Error(payload?.error || "Invalid credentials.");
  }
  return payload.user as DemoUser;
};

export const logoutAccount = async () => {
  await requestJson("/api/auth/logout", { method: "POST" });
};

export const fetchSessionUser = async () => {
  const { response, payload } = await requestJson("/api/auth/session", { method: "GET" });
  if (!response.ok || !payload) return null;
  if (!payload.authenticated || !payload.user) return null;
  return payload.user as DemoUser;
};

export const requestPasswordResetLink = async (input: { email: string }) => {
  const { response, payload } = await requestJson("/api/auth/forgot-password", {
    method: "POST",
    body: JSON.stringify(input),
  });
  if (!response.ok) {
    throw new Error(payload?.error || "Permintaan tautan reset gagal.");
  }
  return payload;
};

export const resetAccountPassword = async (input: { token: string; password: string }) => {
  const { response, payload } = await requestJson("/api/auth/reset-password", {
    method: "POST",
    body: JSON.stringify(input),
  });
  if (!response.ok) {
    throw new Error(payload?.error || "Reset kata sandi gagal.");
  }
  return payload;
};

export const fetchAccountState = async () => {
  const { response, payload } = await requestJson("/api/user/state", { method: "GET" });
  if (!response.ok || !payload?.state) return null;
  return payload.state as AccountStatePayload;
};

export const patchAccountState = async (patch: Partial<AccountStatePayload>) => {
  const { response, payload } = await requestJson("/api/user/state", {
    method: "PATCH",
    body: JSON.stringify(patch),
  });
  if (!response.ok) return null;
  return payload?.state ?? null;
};
