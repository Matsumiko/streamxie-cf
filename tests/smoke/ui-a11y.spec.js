import { expect, test } from "@playwright/test";

const ROUTES = [
  "/",
  "/browse",
  "/search?q=avatar",
  "/my-list",
  "/watch/tmdb--movie--1007757",
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
