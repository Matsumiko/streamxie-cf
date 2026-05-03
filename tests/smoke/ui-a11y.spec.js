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
  "/forgot-password",
  "/reset-password",
  "/streamxie1",
  "/streamxie2",
  "/streamxie3",
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

test("hero slide indicators have touch-friendly size", async ({ page }) => {
  const route = "/";
  const response = await page.goto(route, { waitUntil: "domcontentloaded" });
  expect(response, `Navigation should return a response for ${route}`).not.toBeNull();
  expect(response?.status(), `Expected HTTP 200 for ${route}`).toBe(200);

  await page.waitForTimeout(1200);
  const indicator = page.getByRole("button", { name: /Go to slide/i }).first();
  await expect(indicator).toBeVisible();

  const box = await indicator.boundingBox();
  expect(box, "Hero indicator bounding box should exist").not.toBeNull();
  expect(box?.width ?? 0, "Hero indicator width should be >= 40px").toBeGreaterThanOrEqual(40);
  expect(box?.height ?? 0, "Hero indicator height should be >= 40px").toBeGreaterThanOrEqual(40);
});

test("search filters and add-to-list controls have touch-friendly size", async ({ page }) => {
  const route = "/search?q=avatar";
  const response = await page.goto(route, { waitUntil: "domcontentloaded" });
  expect(response, `Navigation should return a response for ${route}`).not.toBeNull();
  expect(response?.status(), `Expected HTTP 200 for ${route}`).toBe(200);

  await page.waitForTimeout(1200);

  const sortButton = page.getByRole("button", { name: /Relevance|Top Rated|Newest First|Oldest First|A–Z/i }).first();
  await expect(sortButton).toBeVisible();
  const sortBox = await sortButton.boundingBox();
  expect(sortBox, "Sort button bounding box should exist").not.toBeNull();
  expect(sortBox?.height ?? 0, "Sort button height should be >= 40px").toBeGreaterThanOrEqual(40);

  const genreChip = page.getByRole("button", { name: /^Action$/i }).first();
  await expect(genreChip).toBeVisible();
  const chipBox = await genreChip.boundingBox();
  expect(chipBox, "Genre chip bounding box should exist").not.toBeNull();
  expect(chipBox?.height ?? 0, "Genre chip height should be >= 40px").toBeGreaterThanOrEqual(40);

  const addButton = page.getByRole("button", { name: "Add to My List" }).first();
  await expect(addButton).toBeVisible();
  const addBox = await addButton.boundingBox();
  expect(addBox, "Add-to-list button bounding box should exist").not.toBeNull();
  expect(addBox?.width ?? 0, "Add-to-list button width should be >= 40px").toBeGreaterThanOrEqual(40);
  expect(addBox?.height ?? 0, "Add-to-list button height should be >= 40px").toBeGreaterThanOrEqual(40);
});

test("desktop navbar and carousel controls have touch-friendly size", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name.includes("mobile"), "Desktop-specific controls");

  const route = "/";
  const response = await page.goto(route, { waitUntil: "domcontentloaded" });
  expect(response, `Navigation should return a response for ${route}`).not.toBeNull();
  expect(response?.status(), `Expected HTTP 200 for ${route}`).toBe(200);

  await page.waitForTimeout(1200);

  const browseButton = page.locator("header").getByRole("button", { name: "Browse" }).first();
  await expect(browseButton).toBeVisible();
  const browseBox = await browseButton.boundingBox();
  expect(browseBox, "Browse button bounding box should exist").not.toBeNull();
  expect(browseBox?.height ?? 0, "Browse button height should be >= 40px").toBeGreaterThanOrEqual(40);

  const openSearch = page.getByRole("button", { name: "Open search" });
  await expect(openSearch).toBeVisible();
  const openSearchBox = await openSearch.boundingBox();
  expect(openSearchBox, "Open search button bounding box should exist").not.toBeNull();
  expect(openSearchBox?.height ?? 0, "Open search button height should be >= 40px").toBeGreaterThanOrEqual(40);

  const scrollLeft = page.getByRole("button", { name: "Scroll left" }).first();
  const scrollRight = page.getByRole("button", { name: "Scroll right" }).first();
  if ((await scrollLeft.count()) === 0 || (await scrollRight.count()) === 0) {
    return;
  }
  await expect(scrollLeft).toBeVisible();
  await expect(scrollRight).toBeVisible();

  const leftBox = await scrollLeft.boundingBox();
  const rightBox = await scrollRight.boundingBox();
  expect(leftBox, "Scroll left button bounding box should exist").not.toBeNull();
  expect(rightBox, "Scroll right button bounding box should exist").not.toBeNull();
  expect(leftBox?.width ?? 0, "Scroll left button width should be >= 40px").toBeGreaterThanOrEqual(40);
  expect(leftBox?.height ?? 0, "Scroll left button height should be >= 40px").toBeGreaterThanOrEqual(40);
  expect(rightBox?.width ?? 0, "Scroll right button width should be >= 40px").toBeGreaterThanOrEqual(40);
  expect(rightBox?.height ?? 0, "Scroll right button height should be >= 40px").toBeGreaterThanOrEqual(40);
});

test("footer social controls have touch-friendly size", async ({ page }) => {
  const route = "/search?q=avatar";
  const response = await page.goto(route, { waitUntil: "domcontentloaded" });
  expect(response, `Navigation should return a response for ${route}`).not.toBeNull();
  expect(response?.status(), `Expected HTTP 200 for ${route}`).toBe(200);

  for (const label of ["Twitter", "Instagram", "GitHub"]) {
    const socialButton = page.getByRole("button", { name: label });
    await socialButton.scrollIntoViewIfNeeded();
    await expect(socialButton).toBeVisible();
    const box = await socialButton.boundingBox();
    expect(box, `${label} button bounding box should exist`).not.toBeNull();
    expect(box?.width ?? 0, `${label} button width should be >= 40px`).toBeGreaterThanOrEqual(40);
    expect(box?.height ?? 0, `${label} button height should be >= 40px`).toBeGreaterThanOrEqual(40);
  }
});

test("watch source controls have touch-friendly size", async ({ page }) => {
  const route = "/watch/tmdb--movie--1007757";
  const response = await page.goto(route, { waitUntil: "domcontentloaded" });
  expect(response, `Navigation should return a response for ${route}`).not.toBeNull();
  expect(response?.status(), `Expected HTTP 200 for ${route}`).toBe(200);

  await page.waitForTimeout(1200);

  const sourceButtons = page.locator("main details button");
  if ((await sourceButtons.count()) === 0) {
    return;
  }

  const sourceButton = sourceButtons.first();
  await sourceButton.scrollIntoViewIfNeeded();
  await expect(sourceButton).toBeVisible();

  const box = await sourceButton.boundingBox();
  expect(box, "Watch source button bounding box should exist").not.toBeNull();
  expect(box?.height ?? 0, "Watch source button height should be >= 40px").toBeGreaterThanOrEqual(40);
});

test("tombol sumber stream bisa diaktifkan dengan tombol Space saat fokus keyboard", async ({ page }) => {
  const route = "/watch/tmdb--movie--1007757";
  const response = await page.goto(route, { waitUntil: "domcontentloaded" });
  expect(response, `Navigation should return a response for ${route}`).not.toBeNull();
  expect(response?.status(), `Expected HTTP 200 for ${route}`).toBe(200);

  await page.waitForTimeout(1200);

  const sourceButtons = page.locator("main details[open] button");
  if ((await sourceButtons.count()) < 2) {
    return;
  }

  const firstButton = sourceButtons.nth(0);
  const secondButton = sourceButtons.nth(1);
  const firstClass = (await firstButton.getAttribute("class")) || "";
  const targetButton = /border-primary\/60/.test(firstClass) ? secondButton : firstButton;

  await expect(targetButton).toBeVisible();
  await expect(targetButton).not.toHaveClass(/border-primary\/60/);
  await targetButton.focus();
  await page.keyboard.press("Space");
  await page.waitForTimeout(400);
  await expect(targetButton).toHaveClass(/border-primary\/60/);
});

test("browse filter toggle has touch-friendly size", async ({ page }) => {
  const route = "/browse";
  const response = await page.goto(route, { waitUntil: "domcontentloaded" });
  expect(response, `Navigation should return a response for ${route}`).not.toBeNull();
  expect(response?.status(), `Expected HTTP 200 for ${route}`).toBe(200);

  const toggle = page.getByRole("button", { name: /Show Filters|Hide Filters/i });
  await expect(toggle).toBeVisible();
  const box = await toggle.boundingBox();
  expect(box, "Browse filter toggle bounding box should exist").not.toBeNull();
  expect(box?.height ?? 0, "Browse filter toggle height should be >= 40px").toBeGreaterThanOrEqual(40);
});

test("mobile bottom navigation terdaftar sebagai landmark nav", async ({ page }, testInfo) => {
  test.skip(!testInfo.project.name.includes("mobile"), "Mobile-specific control");

  const route = "/search?q=avatar";
  const response = await page.goto(route, { waitUntil: "domcontentloaded" });
  expect(response, `Navigation should return a response for ${route}`).not.toBeNull();
  expect(response?.status(), `Expected HTTP 200 for ${route}`).toBe(200);

  const bottomNav = page.locator("nav[aria-label='Navigasi bawah']");
  await expect(bottomNav).toBeVisible();
  await expect(bottomNav.getByRole("link", { name: "Home" })).toBeVisible();
  await expect(bottomNav.getByRole("link", { name: "Search" })).toBeVisible();
});

test("detail synopsis and season controls have touch-friendly size", async ({ page }) => {
  const movieRoute = "/movie/tmdb--movie--1007757";
  const movieResponse = await page.goto(movieRoute, { waitUntil: "domcontentloaded" });
  expect(movieResponse, `Navigation should return a response for ${movieRoute}`).not.toBeNull();
  expect(movieResponse?.status(), `Expected HTTP 200 for ${movieRoute}`).toBe(200);

  const readMore = page.getByRole("button", { name: /Read more|Read less/i }).first();
  if ((await readMore.count()) === 0) {
    return;
  }
  await expect(readMore).toBeVisible();
  const readMoreBox = await readMore.boundingBox();
  expect(readMoreBox, "Synopsis toggle bounding box should exist").not.toBeNull();
  expect(readMoreBox?.height ?? 0, "Synopsis toggle height should be >= 40px").toBeGreaterThanOrEqual(40);

  const seriesRoute = "/series/tmdb--tv--202250";
  const seriesResponse = await page.goto(seriesRoute, { waitUntil: "domcontentloaded" });
  expect(seriesResponse, `Navigation should return a response for ${seriesRoute}`).not.toBeNull();
  expect(seriesResponse?.status(), `Expected HTTP 200 for ${seriesRoute}`).toBe(200);

  const seasonTrigger = page.getByRole("combobox").first();
  if ((await seasonTrigger.count()) === 0) {
    return;
  }
  await expect(seasonTrigger).toBeVisible();
  await expect(seasonTrigger).toHaveAccessibleName(/season/i);
  const seasonBox = await seasonTrigger.boundingBox();
  expect(seasonBox, "Season trigger bounding box should exist").not.toBeNull();
  expect(seasonBox?.height ?? 0, "Season trigger height should be >= 40px").toBeGreaterThanOrEqual(40);
});

test("series episode list tidak menyisakan kartu tersembunyi terlalu lama", async ({ page }) => {
  const route = "/series/tmdb--tv--202250";
  const response = await page.goto(route, { waitUntil: "domcontentloaded" });
  expect(response, `Navigation should return a response for ${route}`).not.toBeNull();
  expect(response?.status(), `Expected HTTP 200 for ${route}`).toBe(200);

  await page.waitForTimeout(2200);

  const hiddenCount = await page.evaluate(() => {
    const cards = Array.from(document.querySelectorAll("section .group.flex.gap-4.rounded-xl.border"));
    return cards.filter((card) => Number.parseFloat(window.getComputedStyle(card).opacity) < 0.99).length;
  });

  expect(hiddenCount, "Episode cards should finish fade-in quickly on series detail").toBe(0);
});

test("cast dan crew cards tampil penuh tanpa opacity rendah berkepanjangan", async ({ page }) => {
  const route = "/series/tmdb--tv--202250";
  const response = await page.goto(route, { waitUntil: "domcontentloaded" });
  expect(response, `Navigation should return a response for ${route}`).not.toBeNull();
  expect(response?.status(), `Expected HTTP 200 for ${route}`).toBe(200);

  await page.waitForTimeout(1800);

  const hiddenCount = await page.evaluate(() => {
    const cards = Array.from(document.querySelectorAll("div[aria-label$='horizontal list'] > div"));
    if (cards.length === 0) return 0;
    return cards.filter((card) => Number.parseFloat(window.getComputedStyle(card).opacity) < 0.99).length;
  });

  expect(hiddenCount, "Cast/Crew cards should be fully visible shortly after render").toBe(0);
});

test("detail media navigation controls have touch-friendly size", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name.includes("mobile"), "Desktop-specific controls");

  const route = "/movie/tmdb--movie--1007757";
  const response = await page.goto(route, { waitUntil: "domcontentloaded" });
  expect(response, `Navigation should return a response for ${route}`).not.toBeNull();
  expect(response?.status(), `Expected HTTP 200 for ${route}`).toBe(200);

  const prevButton = page.getByRole("button", { name: "Previous media" }).first();
  const nextButton = page.getByRole("button", { name: "Next media" }).first();
  if ((await prevButton.count()) === 0 || (await nextButton.count()) === 0) {
    return;
  }

  await expect(prevButton).toBeVisible();
  await expect(nextButton).toBeVisible();

  const prevBox = await prevButton.boundingBox();
  const nextBox = await nextButton.boundingBox();
  expect(prevBox, "Previous media button bounding box should exist").not.toBeNull();
  expect(nextBox, "Next media button bounding box should exist").not.toBeNull();
  expect(prevBox?.width ?? 0, "Previous media button width should be >= 40px").toBeGreaterThanOrEqual(40);
  expect(prevBox?.height ?? 0, "Previous media button height should be >= 40px").toBeGreaterThanOrEqual(40);
  expect(nextBox?.width ?? 0, "Next media button width should be >= 40px").toBeGreaterThanOrEqual(40);
  expect(nextBox?.height ?? 0, "Next media button height should be >= 40px").toBeGreaterThanOrEqual(40);
});

test("search inputs expose accessible names", async ({ page }) => {
  const searchRoute = "/search?q=avatar";
  const searchResponse = await page.goto(searchRoute, { waitUntil: "domcontentloaded" });
  expect(searchResponse, `Navigation should return a response for ${searchRoute}`).not.toBeNull();
  expect(searchResponse?.status(), `Expected HTTP 200 for ${searchRoute}`).toBe(200);

  const searchInput = page.getByRole("textbox", { name: /Search /i }).first();
  await expect(searchInput).toBeVisible();

  const homeRoute = "/";
  const homeResponse = await page.goto(homeRoute, { waitUntil: "domcontentloaded" });
  expect(homeResponse, `Navigation should return a response for ${homeRoute}`).not.toBeNull();
  expect(homeResponse?.status(), `Expected HTTP 200 for ${homeRoute}`).toBe(200);

  const openSearch = page.getByRole("button", { name: /Open search|Search/i }).first();
  await expect(openSearch).toBeVisible();
  await openSearch.click();

  const paletteInput = page.getByRole("textbox", { name: /Search /i }).first();
  await expect(paletteInput).toBeVisible();
});

test("navbar brand link exposes explicit accessible name", async ({ page }) => {
  const route = "/login";
  const response = await page.goto(route, { waitUntil: "domcontentloaded" });
  expect(response, `Navigation should return a response for ${route}`).not.toBeNull();
  expect(response?.status(), `Expected HTTP 200 for ${route}`).toBe(200);

  const brandLink = page.locator("header a[href='/']").first();
  await expect(brandLink).toHaveAttribute("aria-label", /go to home/i);
});

test("detail cast carousel is keyboard-focusable", async ({ page }) => {
  const route = "/movie/tmdb--movie--1007757";
  const response = await page.goto(route, { waitUntil: "domcontentloaded" });
  expect(response, `Navigation should return a response for ${route}`).not.toBeNull();
  expect(response?.status(), `Expected HTTP 200 for ${route}`).toBe(200);

  const scroller = page.locator("section div[aria-label$='horizontal list']").first();
  if ((await scroller.count()) === 0) {
    return;
  }

  await expect(scroller).toHaveAttribute("tabindex", "0");
});

test("watch page memiliki heading level satu untuk struktur dokumen", async ({ page }) => {
  const route = "/watch/tmdb--movie--1007757";
  const response = await page.goto(route, { waitUntil: "domcontentloaded" });
  expect(response, `Navigation should return a response for ${route}`).not.toBeNull();
  expect(response?.status(), `Expected HTTP 200 for ${route}`).toBe(200);

  const heading = page.locator("main h1").first();
  await expect(heading).toHaveCount(1);
  await expect(heading).toContainText(/watch/i);
});

test("route kritikal memiliki heading level satu", async ({ page }) => {
  const routes = ["/browse", "/movie/tmdb--movie--1007757", "/series/tmdb--tv--202250", "/streamxie1", "/streamxie2", "/streamxie3"];

  for (const route of routes) {
    const response = await page.goto(route, { waitUntil: "domcontentloaded" });
    expect(response, `Navigation should return a response for ${route}`).not.toBeNull();
    expect(response?.status(), `Expected HTTP 200 for ${route}`).toBe(200);

    const h1 = page.locator("main h1");
    await expect(h1, `Route ${route} should expose exactly one h1`).toHaveCount(1);
  }
});

test("badge PRO di profile memenuhi kontras minimum", async ({ page }) => {
  const route = "/profile";
  const response = await page.goto(route, { waitUntil: "domcontentloaded" });
  expect(response, `Navigation should return a response for ${route}`).not.toBeNull();
  expect(response?.status(), `Expected HTTP 200 for ${route}`).toBe(200);

  const badge = page.locator("span", { hasText: /^PRO$/ }).first();
  await expect(badge).toBeVisible();

  const contrast = await badge.evaluate((el) => {
    const toRgb = (value) => {
      const matched = value.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/i);
      if (!matched) return { r: 0, g: 0, b: 0 };
      return { r: Number(matched[1]), g: Number(matched[2]), b: Number(matched[3]) };
    };
    const toLinear = (channel) => {
      const normalized = channel / 255;
      return normalized <= 0.03928
        ? normalized / 12.92
        : ((normalized + 0.055) / 1.055) ** 2.4;
    };
    const luminance = ({ r, g, b }) => 0.2126 * toLinear(r) + 0.7152 * toLinear(g) + 0.0722 * toLinear(b);

    const style = window.getComputedStyle(el);
    const fg = toRgb(style.color);
    const bg = toRgb(style.backgroundColor);
    const l1 = luminance(fg);
    const l2 = luminance(bg);
    const [light, dark] = l1 >= l2 ? [l1, l2] : [l2, l1];
    return (light + 0.05) / (dark + 0.05);
  });

  expect(contrast, "Kontras badge PRO harus >= 4.5:1").toBeGreaterThanOrEqual(4.5);
});
