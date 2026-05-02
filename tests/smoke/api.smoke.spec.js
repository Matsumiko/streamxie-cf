import { expect, test } from "@playwright/test";

const RUN_ON_PROJECT = "desktop-chromium";

const ensureSingleProjectRun = (testInfo) => {
  test.skip(testInfo.project.name !== RUN_ON_PROJECT, `API smoke runs only on ${RUN_ON_PROJECT}.`);
};

test("core APIs respond with expected status and shape", async ({ request }, testInfo) => {
  ensureSingleProjectRun(testInfo);

  const sessionRes = await request.get("/api/auth/session");
  expect(sessionRes.status()).toBe(200);
  const session = await sessionRes.json();
  expect(typeof session.status).toBe("boolean");
  expect(typeof session.authenticated).toBe("boolean");

  const userStateUnauthorized = await request.get("/api/user/state");
  expect(userStateUnauthorized.status()).toBe(401);

  const tmdbRes = await request.get("/api/tmdb/trending/all/day?page=1");
  expect(tmdbRes.status()).toBe(200);
  const tmdbPayload = await tmdbRes.json();
  expect(Array.isArray(tmdbPayload.results)).toBeTruthy();

  const healthRes = await request.get("/api/xie/health");
  expect(healthRes.status()).toBe(200);
  const health = await healthRes.json();
  expect(Array.isArray(health.providers)).toBeTruthy();
  expect(health.providers).toEqual(expect.arrayContaining(["xie-1", "kacain-1", "kacain-3", "kacain-4"]));

  const xieWatchRes = await request.get("/api/xie/xie-1/watch/movie/1007757");
  expect(xieWatchRes.status()).toBe(200);
  const xieWatch = await xieWatchRes.json();
  expect(xieWatch?.status).toBeTruthy();
  expect(Array.isArray(xieWatch?.data?.providers)).toBeTruthy();
  expect(xieWatch.data.providers.length).toBeGreaterThan(0);
});

test("auth + account-state lifecycle works when explicitly enabled", async ({ playwright }, testInfo) => {
  ensureSingleProjectRun(testInfo);
  test.skip(process.env.SMOKE_RUN_AUTH !== "1", "Set SMOKE_RUN_AUTH=1 to run auth write-flow smoke.");

  const baseURL = process.env.SMOKE_BASE_URL || "https://streamxie.pages.dev";
  const api = await playwright.request.newContext({ baseURL });

  const email = `qa.smoke.${Date.now()}@example.com`;
  const password = "QaPass!2026";

  const registerRes = await api.post("/api/auth/register", {
    data: { name: "QA Smoke", email, password },
  });
  expect(registerRes.status()).toBe(200);
  const registered = await registerRes.json();
  expect(registered?.status).toBeTruthy();
  expect(registered?.user?.email).toBe(email);

  const loginRes = await api.post("/api/auth/login", {
    data: { email, password },
  });
  expect(loginRes.status()).toBe(200);

  const sessionAfterLoginRes = await api.get("/api/auth/session");
  expect(sessionAfterLoginRes.status()).toBe(200);
  const sessionAfterLogin = await sessionAfterLoginRes.json();
  expect(sessionAfterLogin?.authenticated).toBeTruthy();
  expect(sessionAfterLogin?.user?.email).toBe(email);

  const patchRes = await api.patch("/api/user/state", {
    data: {
      myList: ["tmdb--movie--1007757"],
      watchProgress: {},
      searchHistory: ["qa-smoke-auth"],
      avatarId: "streamxie-avatar-1",
    },
  });
  expect(patchRes.status()).toBe(200);
  const patched = await patchRes.json();
  expect(patched?.state?.myList).toEqual(expect.arrayContaining(["tmdb--movie--1007757"]));

  const getStateRes = await api.get("/api/user/state");
  expect(getStateRes.status()).toBe(200);
  const statePayload = await getStateRes.json();
  expect(statePayload?.state?.searchHistory).toEqual(expect.arrayContaining(["qa-smoke-auth"]));
  expect(statePayload?.state?.avatarId).toBe("streamxie-avatar-1");

  const logoutRes = await api.post("/api/auth/logout");
  expect(logoutRes.status()).toBe(200);

  const sessionAfterLogoutRes = await api.get("/api/auth/session");
  expect(sessionAfterLogoutRes.status()).toBe(200);
  const sessionAfterLogout = await sessionAfterLogoutRes.json();
  expect(sessionAfterLogout?.authenticated).toBeFalsy();

  await api.dispose();
});
