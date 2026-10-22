import { test, expect, Page } from "@playwright/test";

// Mock markers to avoid Discourse API dependency
async function setMarkers(
  page: Page,
  markers: { lat: number; lon: number; name: string }[],
) {
  await page.addInitScript((data) => {
    const observer = new MutationObserver(() => {
      const markerData = document.getElementById("map-markers");
      if (
        markerData &&
        document.querySelector('script[src*="/community-map.js"]')
      ) {
        markerData.textContent = JSON.stringify(data);
        observer.disconnect();
      }
    });

    observer.observe(document, { childList: true, subtree: true });
  }, markers);
}

test("Circles map renders a basemap and opens marker popups", async ({
  page,
}) => {
  await setMarkers(page, [{ lat: 0, lon: 0, name: "Test Circle" }]);
  await page.goto("/community/circles");

  const map = page.locator("#locations-map");
  await expect(map).toBeVisible();
  await expect(
    map.locator('.leaflet-overlay-pane path:not([d="M0 0"])').first(),
  ).toBeVisible();
  await expect(
    map.locator('a[href="https://www.naturalearthdata.com/"]'),
  ).toBeVisible();
  const marker = map.locator(".leaflet-marker-icon");
  await expect(marker).toHaveCount(1);
  await marker.click();
  await expect(map.locator(".leaflet-popup-content")).toHaveText("Test Circle");
});

test("Page content remains available when the map script fails", async ({
  page,
}) => {
  await page.route("**/community-map.js**", (route) => route.abort());
  await page.goto("/community/circles");

  await expect(
    page.getByRole("heading", { name: "Join an Ubuntu Circle" }),
  ).toBeVisible();
  await expect(
    page.getByRole("link", {
      name: "Take a look at how our community can support you.",
    }),
  ).toBeVisible();
});
