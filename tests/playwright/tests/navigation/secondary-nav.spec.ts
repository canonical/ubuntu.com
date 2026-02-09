import { test, expect } from "@playwright/test";
import { NavigationComponent } from "../../helpers/navigation";
import {
  getSecondaryNavSections,
  getSecondaryNavChildTitles,
} from "../../helpers/navigation-data";

const sections = getSecondaryNavSections();

test.describe("Secondary navigation", () => {
  let nav: NavigationComponent;

  test.beforeEach(async ({ page }) => {
    nav = new NavigationComponent(page);
  });

  for (const { key, section } of sections) {
    test(`${section.path} shows secondary nav with title "${section.title}"`, async () => {
      await nav.goto(section.path);

      await expect(nav.secondaryNav).toBeVisible();
      await expect(nav.secondaryNavTitle).toContainText(section.title);
    });

    const childTitles = getSecondaryNavChildTitles(key);

    if (childTitles.length > 0) {
      test(`${section.path} has expected child items`, async () => {
        await nav.goto(section.path);

        for (const title of childTitles) {
          await expect(
            nav.secondaryNav.getByRole("link", { name: title }).first()
          ).toBeVisible();
        }
      });
    }
  }

  test("homepage does not show secondary navigation", async () => {
    await nav.goto("/");

    await expect(nav.secondaryNav).toHaveCount(0);
  });
});
