import { expect, test } from "@playwright/test";

const ROUTES = [
  "/",
  "/browse",
  "/search?q=avatar",
  "/watch/tmdb--movie--1007757",
  "/my-list",
  "/privacy",
  "/streamxie1",
  "/streamxie2",
  "/streamxie3",
];

const IGNORED_CONSOLE_ERRORS = [
  /Failed to load resource/i,
];

for (const route of ROUTES) {
  test(`route renders without fatal runtime issues: ${route}`, async ({ page }) => {
    const consoleErrors = [];
    const pageErrors = [];

    page.on("console", (msg) => {
      if (msg.type() !== "error") return;
      const text = msg.text();
      if (IGNORED_CONSOLE_ERRORS.some((pattern) => pattern.test(text))) return;
      consoleErrors.push(text);
    });

    page.on("pageerror", (error) => {
      pageErrors.push(String(error?.message || error));
    });

    const response = await page.goto(route, { waitUntil: "domcontentloaded" });
    expect(response, `Navigation should return a response for ${route}`).not.toBeNull();
    expect(response?.status(), `Expected HTTP 200 for ${route}`).toBe(200);

    await page.waitForTimeout(1_500);

    const title = await page.title();
    expect(title.trim().length, `Title should be present for ${route}`).toBeGreaterThan(0);

    const bodyTextLength = await page.evaluate(() => (document.body?.innerText || "").replace(/\s+/g, " ").trim().length);
    expect(bodyTextLength, `Body text should be non-trivial for ${route}`).toBeGreaterThan(120);

    expect(pageErrors, `Unexpected page errors on ${route}: ${pageErrors.join(" | ")}`).toEqual([]);
    expect(consoleErrors, `Unexpected console errors on ${route}: ${consoleErrors.join(" | ")}`).toEqual([]);
  });
}

test("anonymous watch route does not trigger account-state sync request", async ({ page }) => {
  const userStateRequests = [];

  page.on("request", (request) => {
    const url = request.url();
    if (url.includes("/api/user/state")) {
      userStateRequests.push({ method: request.method(), url });
    }
  });

  const response = await page.goto("/watch/tmdb--movie--1007757", { waitUntil: "domcontentloaded" });
  expect(response, "Navigation should return a response for watch route").not.toBeNull();
  expect(response?.status(), "Watch route should return 200").toBe(200);

  await page.waitForTimeout(2500);

  expect(userStateRequests, `Anonymous session should not call /api/user/state, got: ${JSON.stringify(userStateRequests)}`).toEqual([]);
});
