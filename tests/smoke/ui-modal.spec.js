import { expect, test } from "@playwright/test";

test("trailer modal menjaga fokus keyboard dengan benar", async ({ page }) => {
  const response = await page.goto("/movie/tmdb--movie--1007757", { waitUntil: "domcontentloaded" });
  expect(response, "Navigation harus menghasilkan response").not.toBeNull();
  expect(response?.status(), "Route detail movie harus 200").toBe(200);

  await page.waitForTimeout(1_500);

  const trailerButton = page.getByRole("button", { name: /^Trailer$/i }).first();
  await expect(trailerButton).toBeVisible();
  await trailerButton.click();

  const dialog = page.getByRole("dialog");
  await expect(dialog).toBeVisible();

  const closeButton = page.getByRole("button", { name: "Close trailer" });
  await expect(closeButton).toBeFocused();

  // Dengan fokus trap aktif, Tab tidak boleh keluar dari modal.
  await page.keyboard.press("Tab");
  await expect(closeButton).toBeFocused();

  await page.keyboard.press("Escape");
  await expect(dialog).toBeHidden();
  await expect(trailerButton).toBeFocused();
});
