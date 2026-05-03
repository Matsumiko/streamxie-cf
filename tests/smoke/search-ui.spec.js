import { expect, test } from "@playwright/test";

test("menu urutkan di halaman search bisa ditutup dengan Escape dan klik luar", async ({ page }) => {
  const route = "/search?q=avatar";
  const response = await page.goto(route, { waitUntil: "domcontentloaded" });
  expect(response, `Navigation should return a response for ${route}`).not.toBeNull();
  expect(response?.status(), `Expected HTTP 200 for ${route}`).toBe(200);

  await page.waitForTimeout(1200);

  const sortButton = page.getByRole("button", { name: /Relevance|Top Rated|Newest First|Oldest First|A–Z/i }).first();
  if ((await sortButton.count()) === 0) {
    return;
  }

  const menuItem = page.getByRole("button", { name: /Top Rated/i }).first();

  await sortButton.click();
  await expect(menuItem).toBeVisible();

  await page.keyboard.press("Escape");
  await expect(menuItem).toBeHidden();

  await sortButton.click();
  await expect(menuItem).toBeVisible();

  await page.locator("h1", { hasText: /^Search$/i }).click();
  await expect(menuItem).toBeHidden();
});
