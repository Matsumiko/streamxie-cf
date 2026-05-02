import { expect, test } from "@playwright/test";

const ROUTES = [
  "/",
  "/browse",
  "/search?q=avatar",
  "/movie/tmdb--movie--1007757",
  "/series/tmdb--tv--202250",
  "/my-list",
  "/watch/tmdb--movie--1007757",
  "/login",
  "/register",
  "/reset-password",
  "/streamxie1",
];

for (const route of ROUTES) {
  test(`interactive controls expose accessible names: ${route}`, async ({ page }) => {
    const response = await page.goto(route, { waitUntil: "domcontentloaded" });
    expect(response, `Navigation should return a response for ${route}`).not.toBeNull();
    expect(response?.status(), `Expected HTTP 200 for ${route}`).toBe(200);

    await page.waitForTimeout(1_200);

    const unnamedControls = await page.evaluate(() => {
      const isHidden = (el) => {
        if (el.getAttribute("aria-hidden") === "true") return true;
        const style = window.getComputedStyle(el);
        if (style.display === "none" || style.visibility === "hidden") return true;
        const rect = el.getBoundingClientRect();
        return rect.width < 1 || rect.height < 1;
      };

      const controls = [...document.querySelectorAll("button, a, [role='button']")];
      const issues = [];

      for (const el of controls) {
        if (isHidden(el)) continue;
        if (el.getAttribute("disabled") !== null) continue;

        const text = (el.textContent || "").replace(/\s+/g, " ").trim();
        const ariaLabel = (el.getAttribute("aria-label") || "").trim();
        const title = (el.getAttribute("title") || "").trim();
        const labelledBy = (el.getAttribute("aria-labelledby") || "").trim();
        const hasName = !!(text || ariaLabel || title || labelledBy);

        if (!hasName) {
          issues.push({
            tag: el.tagName.toLowerCase(),
            className: el.className,
            snippet: el.outerHTML.slice(0, 180),
          });
        }
      }

      return issues;
    });

    expect(
      unnamedControls,
      `Found unnamed interactive controls on ${route}: ${JSON.stringify(unnamedControls)}`,
    ).toEqual([]);
  });
}

const AUTH_ROUTES = ["/login", "/register", "/reset-password"];

for (const route of AUTH_ROUTES) {
  test(`password visibility toggle has touch-friendly size: ${route}`, async ({ page }) => {
    const response = await page.goto(route, { waitUntil: "domcontentloaded" });
    expect(response, `Navigation should return a response for ${route}`).not.toBeNull();
    expect(response?.status(), `Expected HTTP 200 for ${route}`).toBe(200);

    const toggle = page.getByRole("button", { name: /Tampilkan kata sandi|Sembunyikan kata sandi/i }).first();
    await expect(toggle).toBeVisible();

    const box = await toggle.boundingBox();
    expect(box, `Toggle button bounding box should exist on ${route}`).not.toBeNull();
    expect(box?.width ?? 0, `Toggle button width should be >= 40px on ${route}`).toBeGreaterThanOrEqual(40);
    expect(box?.height ?? 0, `Toggle button height should be >= 40px on ${route}`).toBeGreaterThanOrEqual(40);
  });
}

test("clear search query button has touch-friendly size", async ({ page }) => {
  const route = "/search?q=avatar";
  const response = await page.goto(route, { waitUntil: "domcontentloaded" });
  expect(response, `Navigation should return a response for ${route}`).not.toBeNull();
  expect(response?.status(), `Expected HTTP 200 for ${route}`).toBe(200);

  const clearButton = page.getByRole("button", { name: "Clear search query" });
  await expect(clearButton).toBeVisible();

  const box = await clearButton.boundingBox();
  expect(box, "Clear query button bounding box should exist").not.toBeNull();
  expect(box?.width ?? 0, "Clear query button width should be >= 40px").toBeGreaterThanOrEqual(40);
  expect(box?.height ?? 0, "Clear query button height should be >= 40px").toBeGreaterThanOrEqual(40);
});

test("my-list tabs have touch-friendly size", async ({ page }) => {
  const route = "/my-list";
  const response = await page.goto(route, { waitUntil: "domcontentloaded" });
  expect(response, `Navigation should return a response for ${route}`).not.toBeNull();
  expect(response?.status(), `Expected HTTP 200 for ${route}`).toBe(200);

  const labels = ["Saved", "Continue", "History"];
  for (const label of labels) {
    const tabButton = page.getByRole("tab", { name: new RegExp(label, "i") });
    await expect(tabButton).toBeVisible();
    const box = await tabButton.boundingBox();
    expect(box, `Tab ${label} bounding box should exist`).not.toBeNull();
    expect(box?.height ?? 0, `Tab ${label} height should be >= 40px`).toBeGreaterThanOrEqual(40);
  }
});
