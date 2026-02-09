import { test, expect } from "../../helpers/fixtures";
import { NavigationComponent, NAV_SECTIONS } from "../../helpers/navigation";

const MOBILE_THRESHOLD = 1035;
const MOBILE_VIEWPORT_HEIGHT = 812;

test.describe("Mobile menu", () => {
  test.use({ viewport: { width: MOBILE_THRESHOLD, height: MOBILE_VIEWPORT_HEIGHT } });

  test.beforeEach(async ({ nav }) => {
    await nav.openMobileMenu();
  });

  test("menu button is visible with text Menu", async ({ nav }) => {
    await expect(nav.mobileMenuButton).toBeVisible();
    await expect(nav.mobileMenuButton).toHaveText("Menu");
  });

  test("clicking menu button toggles has-menu-open class", async ({ nav }) => {
    await expect(nav.headerEl).toHaveClass(/has-menu-open/);
  });

  test("clicking menu button again closes menu", async ({ nav }) => {
    await expect(nav.headerEl).toHaveClass(/has-menu-open/);

    await nav.closeMobileMenu();
    await expect(nav.headerEl).not.toHaveClass(/has-menu-open/);
  });

  test("Escape key closes mobile menu", async ({ nav }) => {
    await expect(nav.headerEl).toHaveClass(/has-menu-open/);

    await nav.page.keyboard.press("Escape");
    await expect(nav.headerEl).not.toHaveClass(/has-menu-open/);
  });

  test("tapping a nav item reveals its mobile sub-options", async ({ nav }) => {
    await nav.sectionLink("products").click();

    const mobileDropdown = nav.page.locator("#products-content-mobile");
    await expect(mobileDropdown).toHaveAttribute("aria-hidden", "false", {
      timeout: 1000,
    });
  });
});

test.describe("Responsive navigation", () => {
  const viewports = [
    { name: "mobile", width: 375, height: MOBILE_VIEWPORT_HEIGHT },
    { name: "tablet", width: 768, height: 1024 },
    { name: "desktop", width: 1280, height: 800 },
  ];

  for (const { name, width, height } of viewports) {
    test(`navigation is functional at ${name} (${width}px)`, async ({
      page,
    }) => {
      await page.setViewportSize({ width, height });
      const nav = new NavigationComponent(page);
      await nav.goto("/");

      await expect(nav.header).toBeVisible();

      if (width < MOBILE_THRESHOLD) {
        await expect(nav.mobileMenuButton).toBeVisible();
      } else {
        for (const section of NAV_SECTIONS) {
          await expect(nav.sectionLink(section.id)).toBeVisible();
        }
      }
    });
  }
});
