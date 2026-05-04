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

test("provider watch route tidak stuck di loader sources", async ({ page }) => {
  const listResponse = await page.goto("/streamxie1", { waitUntil: "domcontentloaded" });
  expect(listResponse, "Navigation should return a response for /streamxie1").not.toBeNull();
  expect(listResponse?.status(), "Route /streamxie1 should return 200").toBe(200);

  await page.waitForTimeout(1_500);

  const playHref = await page.evaluate(() => {
    const anchor = Array.from(document.querySelectorAll("a[href^='/watch/kacain-1--']")).find(
      (el) => (el.textContent || "").trim() === "Play",
    );
    return anchor?.getAttribute("href") ?? "";
  });

  if (!playHref) {
    return;
  }

  const watchResponse = await page.goto(playHref, { waitUntil: "domcontentloaded" });
  expect(watchResponse, `Navigation should return a response for ${playHref}`).not.toBeNull();
  expect(watchResponse?.status(), `Route ${playHref} should return 200`).toBe(200);

  await expect
    .poll(
      async () => page.evaluate(() => {
        const inMain = document.querySelector("main");
        const loaderVisible = Boolean(inMain?.querySelector(".stream-loader"));
        const hasPlayable = Boolean(inMain?.querySelector("iframe, video"));
        const hasUnavailableMessage = (inMain?.textContent || "").includes("Stream source unavailable");
        return loaderVisible ? "loading" : hasPlayable || hasUnavailableMessage ? "resolved" : "unknown";
      }),
      { timeout: 20_000, intervals: [500, 1_000, 2_000] },
    )
    .toBe("resolved");
});

test("series watch mempertahankan source terpilih saat pindah episode", async ({ page }) => {
  const response = await page.goto("/watch/tmdb--tv--202250", { waitUntil: "domcontentloaded" });
  expect(response, "Navigation should return a response for the series watch route").not.toBeNull();
  expect(response?.status(), "Series watch route should return 200").toBe(200);

  await expect
    .poll(
      async () => page.evaluate(() => {
        const episodeLink = document.querySelector("a[href*='episode=tmdb--tv--202250-s1e2']");
        const sourceButtons = Array.from(document.querySelectorAll("main details button"));
        return episodeLink && sourceButtons.length > 1 ? "ready" : "waiting";
      }),
      { timeout: 20_000, intervals: [500, 1_000, 2_000] },
    )
    .toBe("ready");

  const preferredSourceLabel = await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll("main details button")).map((button) => ({
      text: (button.textContent || "").trim(),
      selected: button.className.includes("border-primary/60"),
    }));

    const explicitPreferred = buttons.find((button) => !button.selected && button.text.toLowerCase() === "moviesapi");
    if (explicitPreferred) return explicitPreferred.text;

    return buttons.find((button) => !button.selected)?.text ?? "";
  });

  if (!preferredSourceLabel) {
    return;
  }

  await page.locator("main details button", { hasText: preferredSourceLabel }).first().click();

  await expect
    .poll(
      async () => page.evaluate(() => {
        return (
          Array.from(document.querySelectorAll("main details button")).find((button) =>
            button.className.includes("border-primary/60"),
          )?.textContent || ""
        ).trim();
      }),
      { timeout: 10_000, intervals: [300, 800, 1_500] },
    )
    .toBe(preferredSourceLabel);

  await page.getByRole("link", { name: /Belly of the Beast/i }).click();

  await expect
    .poll(
      async () => page.evaluate((expectedLabel) => {
        const selected = (
          Array.from(document.querySelectorAll("main details button")).find((button) =>
            button.className.includes("border-primary/60"),
          )?.textContent || ""
        ).trim();

        const activeMedia = document.querySelector("main iframe, main video");
        const activeSrc =
          activeMedia?.getAttribute("src") ||
          (activeMedia instanceof HTMLVideoElement ? activeMedia.currentSrc || activeMedia.src : "") ||
          "";

        const episodeTwoLoaded =
          activeSrc.includes("/1/2") ||
          activeSrc.includes("-1-2") ||
          activeSrc.includes("season=1") && activeSrc.includes("episode=2");

        return selected === expectedLabel && episodeTwoLoaded ? "matched" : JSON.stringify({ selected, activeSrc });
      }, preferredSourceLabel),
      { timeout: 20_000, intervals: [500, 1_000, 2_000] },
    )
    .toBe("matched");
});

test("watch iframe memakai izin fullscreen tanpa atribut redundan", async ({ page }) => {
  const response = await page.goto("/watch/tmdb--movie--1007757", { waitUntil: "domcontentloaded" });
  expect(response, "Navigation should return a response for watch route").not.toBeNull();
  expect(response?.status(), "Watch route should return 200").toBe(200);

  const iframe = page.locator("main iframe").first();
  await expect(iframe).toBeVisible({ timeout: 20_000 });
  await expect(iframe).toHaveAttribute("title", /watch/i);
  await expect(iframe).toHaveAttribute("allow", /fullscreen/);
  expect(await iframe.getAttribute("allowfullscreen")).toBeNull();
});
