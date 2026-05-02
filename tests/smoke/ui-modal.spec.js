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

test("modal pratinjau media mendukung keyboard dan pemulihan fokus", async ({ page }) => {
  const response = await page.goto("/movie/tmdb--movie--1007757", { waitUntil: "domcontentloaded" });
  expect(response, "Navigation harus menghasilkan response").not.toBeNull();
  expect(response?.status(), "Route detail movie harus 200").toBe(200);

  await page.waitForTimeout(1_500);

  const mediaButton = page.getByRole("button", { name: /Buka pratinjau/i }).first();
  await expect(mediaButton).toBeVisible();
  await mediaButton.click();

  const dialog = page.getByRole("dialog");
  await expect(dialog).toBeVisible();

  const closeButton = page.getByRole("button", { name: "Close media preview" });
  await expect(closeButton).toBeFocused();

  // Fokus tetap di dalam modal saat navigasi Tab.
  await page.keyboard.press("Tab");
  const activeElementInsideDialog = await page.evaluate(() => {
    const dialogElement = document.querySelector("[role='dialog'][aria-modal='true']");
    return Boolean(dialogElement && document.activeElement && dialogElement.contains(document.activeElement));
  });
  expect(activeElementInsideDialog).toBe(true);

  await page.keyboard.press("Escape");
  await expect(dialog).toBeHidden();
  await expect(mediaButton).toBeFocused();
});
