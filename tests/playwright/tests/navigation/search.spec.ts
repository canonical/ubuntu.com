import { test, expect } from "../../helpers/fixtures";

test.describe("Search functionality", () => {
  test("clicking search button opens search", async ({ nav }) => {
    await nav.openSearch();
    await expect(nav.headerEl).toHaveClass(/has-search-open/);
    await expect(nav.searchInput).toBeVisible();
  });

  test("clicking search overlay closes search", async ({ nav }) => {
    await nav.openSearch();
    await expect(nav.headerEl).toHaveClass(/has-search-open/);

    await nav.closeSearchViaOverlay();
    await expect(nav.headerEl).not.toHaveClass(/has-search-open/);
  });

  test("pressing Escape closes search", async ({ nav }) => {
    await nav.openSearch();
    await expect(nav.headerEl).toHaveClass(/has-search-open/);

    await nav.page.keyboard.press("Escape");
    await expect(nav.headerEl).not.toHaveClass(/has-search-open/);
  });

  test("submitting search navigates to search results", async ({ nav }) => {
    await nav.openSearch();
    await nav.searchInput.fill("kubernetes");
    await nav.searchInput.press("Enter");

    await nav.page.waitForURL(/\/search\?q=kubernetes/, { timeout: 10000 });
  });

  test("search form has correct action", async ({ nav }) => {
    await expect(nav.searchForm).toHaveAttribute("action", "/search");
  });

  test("reset button clears search input", async ({ nav }) => {
    await nav.openSearch();
    await nav.searchInput.fill("kubernetes");
    await expect(nav.searchInput).toHaveValue("kubernetes");

    await nav.searchResetButton.click();
    await expect(nav.searchInput).toHaveValue("");
  });
});
