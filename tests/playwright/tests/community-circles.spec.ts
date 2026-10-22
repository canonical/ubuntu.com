import { test, expect } from "@playwright/test";

test("Circles map renders a basemap and opens marker popups", async ({
  page,
}) => {
  await page.goto("/community/circles");

  const map = page.locator("#locations-map");
  await expect(map).toBeVisible();
  await expect(
    map.locator('.leaflet-overlay-pane path:not([d="M0 0"])').first(),
  ).toBeVisible();
  await expect(
    map.locator('a[href="https://www.naturalearthdata.com/"]'),
  ).toBeVisible();
  const marker = map.locator(".leaflet-marker-icon").first();
  await marker.focus();
  await marker.press("Enter");
  await expect(map.locator(".leaflet-popup-content")).not.toBeEmpty();
});

test("Community links remain available when the map script fails", async ({
  page,
}) => {
  await page.route("**/community-map.js**", (route) => route.abort());
  await page.goto("/community/circles");

  await expect(
    page.getByRole("tabpanel").getByRole("link").first(),
  ).toBeVisible();
});
