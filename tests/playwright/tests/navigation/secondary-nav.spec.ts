import { test, expect } from "../../helpers/fixtures";
import {
  getSecondaryNavSections,
  getSecondaryNavChildTitles,
} from "../../helpers/navigation-data";
import { NavigationComponent } from "../../helpers/navigation";

const sections = getSecondaryNavSections();

test.describe("Secondary navigation", () => {
  for (const { key, section } of sections) {
    test(`${section.path} secondary nav`, async ({ page }) => {
      const nav = new NavigationComponent(page);
      await nav.goto(section.path);

      await test.step("shows secondary nav with correct title", async () => {
        await expect(nav.secondaryNav).toBeVisible();
        await expect(nav.secondaryNavTitle).toContainText(section.title);
      });

      const childTitles = getSecondaryNavChildTitles(key);
      if (childTitles.length > 0) {
        await test.step("has expected child items", async () => {
          for (const title of childTitles) {
            await expect(
              nav.secondaryNav.getByRole("link", { name: title }).first()
            ).toBeVisible();
          }
        });
      }
    });
  }

  test("homepage does not show secondary navigation", async ({ nav }) => {
    // Already on homepage via fixture
    await expect(nav.secondaryNav).toHaveCount(0);
  });
});
