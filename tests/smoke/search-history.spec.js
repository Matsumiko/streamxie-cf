import { expect, test } from "@playwright/test";

const SEARCH_HISTORY_KEY = "streamxie-search-history";

test("histori pencarian disanitasi dan tidak menerima query kosong", async ({ page }) => {
  await page.addInitScript((key) => {
    localStorage.setItem(
      key,
      JSON.stringify(["", "   ", "Avatar", " avatar ", "Drama", null, ""]),
    );
  }, SEARCH_HISTORY_KEY);

  const route = "/search";
  const response = await page.goto(route, { waitUntil: "domcontentloaded" });
  expect(response, `Navigation should return a response for ${route}`).not.toBeNull();
  expect(response?.status(), `Expected HTTP 200 for ${route}`).toBe(200);

  const sanitizedBeforeSubmit = await page.evaluate((key) => {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : [];
  }, SEARCH_HISTORY_KEY);
  expect(sanitizedBeforeSubmit).toEqual(["Avatar", "Drama"]);

  const searchInput = page.locator("input[aria-label^='Search ']").first();
  await expect(searchInput).toBeVisible();
  await searchInput.fill("   ");
  await searchInput.press("Enter");
  await page.waitForTimeout(300);

  const afterEmptySubmit = await page.evaluate((key) => {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : [];
  }, SEARCH_HISTORY_KEY);
  expect(afterEmptySubmit).toEqual(["Avatar", "Drama"]);

  await searchInput.fill("  One Piece  ");
  await searchInput.press("Enter");
  await page.waitForTimeout(300);

  const afterValidSubmit = await page.evaluate((key) => {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : [];
  }, SEARCH_HISTORY_KEY);
  expect(afterValidSubmit[0]).toBe("One Piece");
  expect(afterValidSubmit).toEqual(expect.arrayContaining(["Avatar", "Drama"]));
});
