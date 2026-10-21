import { test, expect } from "@playwright/test";

const TILE = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=",
  "base64",
);

test("Circles map renders with tiles, attribution and accessible community list", async ({
  page,
}) => {
  await page.route("https://tile.openstreetmap.org/**", (route) =>
    route.fulfill({ contentType: "image/png", body: TILE }),
  );
  await page.goto("/community/circles");

  const map = page.locator("#locations-map");
  await expect(map).toBeVisible();
  await expect(map).toHaveClass(/leaflet-container/);
  await expect(map.locator(".leaflet-tile").first()).toBeVisible();
  await expect(
    map.locator('a[href="https://www.openstreetmap.org/copyright"]'),
  ).toBeVisible();
  await expect(page.locator(".p-tabs")).toBeVisible();

  await page.route("**/community-map.js**", (route) => route.abort());
  await page.reload();
  await expect(page.locator(".p-tabs")).toBeVisible();
});
