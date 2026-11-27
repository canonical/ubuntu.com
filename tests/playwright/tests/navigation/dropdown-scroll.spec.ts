import { test, expect } from "../../helpers/fixtures";
import { NavigationComponent } from "../../helpers/navigation";

// Regression test for #17035. Also runs in Firefox and WebKit (see
// playwright.config.ts), where the bug appeared; Chrome never had it.
test.describe("Dropdown position after scrolling", () => {
  // "/" and the 404 page have a single header bar; "/azure" has a second
  // section bar (is-reduced).
  const paths = ["/", "/this-page-does-not-exist-404-test", "/azure"];

  for (const path of paths) {
    test(`dropdown opens under the header on ${path}`, async ({ page }) => {
      const nav = new NavigationComponent(page);
      await nav.goto(path);
      // "instant" overrides the site's `scroll-behavior: smooth`
      await page.evaluate(() =>
        window.scrollTo({ top: 3000, behavior: "instant" })
      );
      await expect
        .poll(() => page.evaluate(() => window.scrollY))
        .toBeGreaterThan(0);

      await nav.openDropdown("products");

      // Polled because the panel slides down from translateY(-101%)
      const gapUnderHeader = async () => {
        const headerBox = await nav.headerEl.boundingBox();
        const dropdownBox = await nav.dropdownWindow.boundingBox();
        if (!headerBox || !dropdownBox) return Infinity;
        return Math.abs(dropdownBox.y - (headerBox.y + headerBox.height));
      };
      await expect.poll(gapUnderHeader).toBeLessThanOrEqual(2);

      const dropdownBox = await nav.dropdownWindow.boundingBox();
      expect(dropdownBox!.y).toBeLessThan(page.viewportSize()!.height);
    });
  }
});
