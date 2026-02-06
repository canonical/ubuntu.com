import { test, expect } from "@playwright/test";
import { NavigationComponent, NAV_SECTIONS } from "../../helpers/navigation";

test.describe("Search functionality", () => {
  let nav: NavigationComponent;

  test.beforeEach(async ({ page }) => {
    nav = new NavigationComponent(page);
    await nav.goto("/");
  });

  test("clicking search button opens search", async () => {
    await nav.openSearch();
    await expect(nav.headerEl).toHaveClass(/has-search-open/);
    await expect(nav.searchInput).toBeVisible();
  });

  test("clicking search overlay closes search", async () => {
    await nav.openSearch();
    await expect(nav.headerEl).toHaveClass(/has-search-open/);

    await nav.closeSearchViaOverlay();
    await expect(nav.headerEl).not.toHaveClass(/has-search-open/);
  });

  test("pressing Escape closes search", async () => {
    await nav.openSearch();
    await expect(nav.headerEl).toHaveClass(/has-search-open/);

    await nav.page.keyboard.press("Escape");
    await expect(nav.headerEl).not.toHaveClass(/has-search-open/);
  });

  test("submitting search navigates to search results", async () => {
    await nav.openSearch();
    await nav.searchInput.fill("kubernetes");
    await nav.searchInput.press("Enter");

    await nav.page.waitForURL(/\/search\?q=kubernetes/, { timeout: 10000 });
    expect(nav.page.url()).toContain("/search?q=kubernetes");
  });

  test("search form has correct action", async () => {
    await expect(nav.searchForm).toHaveAttribute("action", "/search");
  });

  test("reset button clears search input", async () => {
    await nav.openSearch();
    await nav.searchInput.fill("kubernetes");
    await expect(nav.searchInput).toHaveValue("kubernetes");

    await nav.searchResetButton.click();
    await expect(nav.searchInput).toHaveValue("");
  });
});
