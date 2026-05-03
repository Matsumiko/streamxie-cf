import { expect, test } from "@playwright/test";

test("forgot password tidak menampilkan sukses palsu saat endpoint gagal", async ({ page }) => {
  let requestCount = 0;
  await page.route("**/api/auth/forgot-password", async (route) => {
    requestCount += 1;
    await route.fulfill({
      status: 405,
      contentType: "application/json",
      body: JSON.stringify({
        status: false,
        error: "Method or path not allowed.",
      }),
    });
  });

  const route = "/forgot-password";
  const response = await page.goto(route, { waitUntil: "domcontentloaded" });
  expect(response, `Navigation should return a response for ${route}`).not.toBeNull();
  expect(response?.status(), `Expected HTTP 200 for ${route}`).toBe(200);

  await page.fill("#fp-email", "qa@example.com");
  await page.getByRole("button", { name: /Send reset link/i }).click();
  await expect(page.getByRole("heading", { name: /Check your inbox/i })).toHaveCount(0);
  await expect(page.getByRole("alert")).toContainText(/belum tersedia/i);
  expect(requestCount, "Forgot-password submit should call endpoint once").toBe(1);
});

test("reset password tanpa token menolak submit sebelum request API", async ({ page }) => {
  let requestCount = 0;
  await page.route("**/api/auth/reset-password", async (route) => {
    requestCount += 1;
    await route.fallback();
  });

  const route = "/reset-password";
  const response = await page.goto(route, { waitUntil: "domcontentloaded" });
  expect(response, `Navigation should return a response for ${route}`).not.toBeNull();
  expect(response?.status(), `Expected HTTP 200 for ${route}`).toBe(200);

  await page.fill("#new-password", "password123");
  await page.fill("#rp-confirm", "password123");
  await page.getByRole("button", { name: /Update password/i }).click();

  await expect(page.getByRole("alert")).toContainText(/tautan reset tidak valid/i);
  await expect(page.getByRole("heading", { name: /Password updated!/i })).toHaveCount(0);
  expect(requestCount, "Submit tanpa token tidak boleh mengirim request reset API").toBe(0);
});

test("reset password dengan token tidak menampilkan sukses palsu saat endpoint gagal", async ({ page }) => {
  let requestCount = 0;
  await page.route("**/api/auth/reset-password", async (route) => {
    requestCount += 1;
    await route.fulfill({
      status: 405,
      contentType: "application/json",
      body: JSON.stringify({
        status: false,
        error: "Method or path not allowed.",
      }),
    });
  });

  const route = "/reset-password?token=test-token";
  const response = await page.goto(route, { waitUntil: "domcontentloaded" });
  expect(response, `Navigation should return a response for ${route}`).not.toBeNull();
  expect(response?.status(), `Expected HTTP 200 for ${route}`).toBe(200);

  await page.fill("#new-password", "password123");
  await page.fill("#rp-confirm", "password123");
  await page.getByRole("button", { name: /Update password/i }).click();

  await expect(page.getByRole("heading", { name: /Password updated!/i })).toHaveCount(0);
  await expect(page.getByRole("alert")).toContainText(/belum tersedia/i);
  expect(requestCount, "Submit reset dengan token harus memanggil endpoint sekali").toBe(1);
});
