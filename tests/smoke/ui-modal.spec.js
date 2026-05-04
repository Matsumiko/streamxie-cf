import { expect, test } from "@playwright/test";

test("trailer modal menjaga fokus keyboard dengan benar", async ({ page }) => {
  const response = await page.goto("/movie/tmdb--movie--1007757", { waitUntil: "domcontentloaded" });
  expect(response, "Navigation harus menghasilkan response").not.toBeNull();
  expect(response?.status(), "Route detail movie harus 200").toBe(200);

  await page.waitForTimeout(1_500);

  const trailerButton = page.getByRole("button", { name: /^Trailer$/i }).first();
  if ((await trailerButton.count()) === 0) {
    return;
  }
  await expect(trailerButton).toBeVisible();
  await trailerButton.click();

  const dialog = page.getByRole("dialog");
  await expect(dialog).toBeVisible();

  const trailerFrame = dialog.locator("iframe").first();
  await expect(trailerFrame).toBeVisible();
  await expect(trailerFrame).toHaveAttribute("referrerpolicy", "no-referrer");
  await expect(trailerFrame).toHaveAttribute("sandbox", /allow-scripts/);

  const closeButton = page.getByRole("button", { name: "Close trailer" });
  await expect(closeButton).toBeFocused();
  await page.waitForTimeout(350);
  const closeBox = await closeButton.boundingBox();
  expect(closeBox, "Bounding box tombol close trailer harus ada").not.toBeNull();
  expect(closeBox?.width ?? 0, "Lebar tombol close trailer minimal 40px").toBeGreaterThanOrEqual(40);
  expect(closeBox?.height ?? 0, "Tinggi tombol close trailer minimal 40px").toBeGreaterThanOrEqual(40);

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
  if ((await mediaButton.count()) === 0) {
    return;
  }
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

test("command palette memulihkan fokus ke tombol pemicu setelah ditutup", async ({ page }) => {
  const warnings = [];
  page.on("console", (message) => {
    if (message.type() === "warning") {
      warnings.push(message.text());
    }
  });

  const response = await page.goto("/", { waitUntil: "domcontentloaded" });
  expect(response, "Navigation harus menghasilkan response").not.toBeNull();
  expect(response?.status(), "Route home harus 200").toBe(200);

  await page.waitForTimeout(1_000);

  const trigger = page.getByRole("button", { name: /Open search|Search/i }).first();
  await expect(trigger).toBeVisible();
  await trigger.click();

  const paletteInput = page.getByRole("textbox", { name: /Search /i }).first();
  await expect(paletteInput).toBeVisible();
  expect(
    warnings,
    "Command palette tidak boleh memunculkan warning DialogContent tanpa description",
  ).not.toContain("Warning: Missing `Description` or `aria-describedby={undefined}` for {DialogContent}.");

  await page.keyboard.press("Escape");
  await expect(paletteInput).toBeHidden();
  await expect(trigger).toBeFocused();
});
