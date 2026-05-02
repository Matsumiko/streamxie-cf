import { expect, test } from "@playwright/test";

const RUN_ON_PROJECT = "desktop-chromium";

test("UI auth journey works when explicitly enabled", async ({ page, request }, testInfo) => {
  test.skip(testInfo.project.name !== RUN_ON_PROJECT, `UI auth smoke runs only on ${RUN_ON_PROJECT}.`);
  test.skip(process.env.SMOKE_RUN_UI_AUTH !== "1", "Set SMOKE_RUN_UI_AUTH=1 to run browser auth journey smoke.");

  const timestamp = Date.now();
  const name = `QA UI ${timestamp}`;
  const email = `qa.ui.${timestamp}@example.com`;
  const password = "QaPass!2026";

  await page.goto("/register", { waitUntil: "domcontentloaded" });
  await expect(page.getByRole("heading", { name: "Create Account" })).toBeVisible();

  await page.getByLabel("Full name").fill(name);
  await page.getByLabel("Email address").fill(email);
  await page.locator("#reg-password").fill(password);
  await page.locator("#confirm-password").fill(password);
  await page.getByRole("button", { name: "Create account" }).click();

  await expect(page).toHaveURL(/\/$/);
  await expect(page.locator("header").getByRole("button", { name: "Go to profile" })).toBeVisible();

  await page.locator("header").getByRole("button", { name: "Go to profile" }).click();
  await expect(page).toHaveURL(/\/profile$/);
  await expect(page.getByRole("button", { name: "Sign out" })).toBeVisible();

  await page.getByRole("button", { name: "Sign out" }).click();
  await expect(page.locator("header").getByRole("link", { name: "Sign in" }).first()).toBeVisible();
  await expect(page.locator("header").getByRole("button", { name: "Go to profile" })).toHaveCount(0);

  const sessionRes = await request.get("/api/auth/session");
  expect(sessionRes.status()).toBe(200);
  const sessionPayload = await sessionRes.json();
  expect(sessionPayload?.authenticated).toBeFalsy();
});
