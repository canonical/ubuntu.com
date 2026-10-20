import { test, expect, Page, Locator } from "@playwright/test";

async function visibleTilesLoaded(map: Locator) {
  return map.evaluate((element) => {
    const bounds = element.getBoundingClientRect();
    const tiles = Array.from(
      element.querySelectorAll<HTMLImageElement>(".leaflet-tile"),
    ).filter((tile) => {
      const rect = tile.getBoundingClientRect();
      return (
        rect.width > 0 &&
        rect.height > 0 &&
        rect.right > bounds.left &&
        rect.left < bounds.right &&
        rect.bottom > bounds.top &&
        rect.top < bounds.bottom
      );
    });
    return (
      tiles.length > 0 &&
      tiles.every(
        (tile) =>
          tile.complete && tile.naturalWidth > 0 && tile.naturalHeight > 0,
      )
    );
  });
}

async function setMarkers(
  page: Page,
  markers: { lat: number | null; lon: number | null; name: string }[],
) {
  await page.addInitScript((data) => {
    // Replace parsed marker data before the external map script executes.
    const observer = new MutationObserver(() => {
      const script = document.getElementById("map-markers");
      if (
        script &&
        document.querySelector('script[src*="/community-map.js"]')
      ) {
        script.textContent = JSON.stringify(data);
        observer.disconnect();
      }
    });
    observer.observe(document, { childList: true, subtree: true });
  }, markers);
}

test("Circles map renders real keyless tiles", async ({ page }) => {
  await page.goto("/community/circles");
  const map = page.locator("#locations-map");
  await expect(map).toBeVisible();
  await expect(map).toHaveClass(/leaflet-container/);
  await expect(page.locator(".js-show-tabs")).toBeVisible();
  await expect(map.locator(".leaflet-tile-pane > div")).toHaveCSS(
    "filter",
    "grayscale(1)",
  );
  await expect.poll(() => visibleTilesLoaded(map)).toBe(true);
  await expect(map.locator(".leaflet-tile").first()).toHaveAttribute(
    "src",
    /^https:\/\/tile\.openstreetmap\.org\/\d+\/\d+\/\d+\.png$/,
  );
  await expect(
    map.locator('a[href="https://www.openstreetmap.org/copyright"]'),
  ).toBeVisible();
});

test("Circles markers include zero coordinates and open popups", async ({
  page,
}) => {
  await setMarkers(page, [
    { lat: 0, lon: 0, name: "Origin" },
    { lat: 52.52, lon: 13.405, name: "Berlin" },
    { lat: null, lon: null, name: "Missing coordinates" },
  ]);
  await page.goto("/community/circles");
  const markers = page.locator("#locations-map .leaflet-marker-icon");
  await expect(markers).toHaveCount(2);
  await markers.first().click();
  await expect(page.locator(".leaflet-popup-content")).toHaveText("Origin");
});

test("Circles map initializes without communities", async ({ page }) => {
  await setMarkers(page, []);
  await page.goto("/community/circles");
  await expect(page.locator("#locations-map")).toHaveClass(/leaflet-container/);
  await expect(page.locator(".js-show-map")).toBeVisible();
  await expect(page.locator(".leaflet-tile").first()).toBeAttached();
  await expect(page.locator(".leaflet-marker-icon")).toHaveCount(0);
});

test("Circles map reports tile service failures", async ({ page }) => {
  const errors: string[] = [];
  page.on("console", (message) => {
    if (message.type() === "error") {
      errors.push(message.text());
    }
  });
  await page.route("https://tile.openstreetmap.org/**", (route) =>
    route.fulfill({ status: 503, body: "Service unavailable" }),
  );
  await page.goto("/community/circles");
  await expect
    .poll(() =>
      errors.some((message) => message.includes("Unable to load map tile:")),
    )
    .toBe(true);
  const map = page.locator("#locations-map");
  await expect(map.locator(".leaflet-tile").first()).toBeAttached();
  expect(await visibleTilesLoaded(map)).toBe(false);
});
