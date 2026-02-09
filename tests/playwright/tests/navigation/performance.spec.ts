import { test, expect } from "../../helpers/fixtures";
import { NavigationComponent, NAV_SECTIONS } from "../../helpers/navigation";

test.describe("Dropdown response performance", () => {
  test.describe("each dropdown response contains .desktop-dropdown-content", () => {
    for (const section of NAV_SECTIONS) {
      test(section.id, async ({ nav }) => {
        const link = nav.sectionLink(section.id);
        const responsePromise = nav.page.waitForResponse((res) =>
          res.url().includes(section.endpoint)
        );
        await link.hover();
        const response = await responsePromise;
        const body = await response.text();
        expect(body).toContain("desktop-dropdown-content");
      });
    }
  });
});

test.describe("Navigation on error pages", () => {
  test("navigation header renders on a 404 page", async ({ page }) => {
    const nav = new NavigationComponent(page);
    await nav.goto("/this-page-does-not-exist-404-test");

    await expect(nav.header).toBeVisible();
    for (const section of NAV_SECTIONS) {
      await expect(nav.sectionLink(section.id)).toBeVisible();
    }
  });
});
