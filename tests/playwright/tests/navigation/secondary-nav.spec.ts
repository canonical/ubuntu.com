import { test, expect } from "../../helpers/fixtures";
import {
  getSecondaryNavSections,
  getSecondaryNavChildTitles,
} from "../../helpers/navigation-data";

const sections = getSecondaryNavSections();

test.describe("Secondary navigation", () => {
  for (const { key, section } of sections) {
    test(`${section.path} shows secondary nav with title "${section.title}"`, async ({ nav }) => {
      await nav.goto(section.path);

      await expect(nav.secondaryNav).toBeVisible();
      await expect(nav.secondaryNavTitle).toContainText(section.title);
    });

    const childTitles = getSecondaryNavChildTitles(key);

    if (childTitles.length > 0) {
      test(`${section.path} has expected child items`, async ({ nav }) => {
        await nav.goto(section.path);

        for (const title of childTitles) {
          await expect(
            nav.secondaryNav.getByRole("link", { name: title }).first()
          ).toBeVisible();
        }
      });
    }
  }

  test("homepage does not show secondary navigation", async ({ nav }) => {
    // Already on homepage via fixture
    await expect(nav.secondaryNav).toHaveCount(0);
  });
});
