import { test, expect } from "@playwright/test";
import { NavigationComponent, NAV_SECTIONS } from "../../helpers/navigation";

test.describe("Navigation rendering", () => {
  let nav: NavigationComponent;

  test.beforeEach(async ({ page }) => {
    nav = new NavigationComponent(page);
    await nav.goto("/");
  });

  test("main navigation header renders with correct classes", async () => {
    await expect(nav.header).toBeVisible();
    await expect(nav.header).toHaveClass(/is-dark/);
  });

  test("logo links to / with text Canonical Ubuntu", async () => {
    await expect(nav.logoLink.first()).toHaveAttribute("href", "/");
    await expect(nav.logoLink.first()).toContainText("Canonical Ubuntu");
  });

  test("dropdown-window container exists with 5 empty content divs", async () => {
    await expect(nav.dropdownWindow).toBeAttached();

    for (const section of NAV_SECTIONS) {
      const contentDiv = nav.sectionContent(section.id);
      await expect(contentDiv).toBeAttached();
      await expect(contentDiv).toHaveClass(/u-hide/);
    }
  });

  test("dropdown-window-overlay exists", async () => {
    await expect(nav.dropdownOverlay).toBeAttached();
  });
});

test.describe("Top-level navigation items", () => {
  let nav: NavigationComponent;

  test.beforeEach(async ({ page }) => {
    nav = new NavigationComponent(page);
    await nav.goto("/");
  });

  test("all 5 nav items visible with correct text", async () => {
    for (const section of NAV_SECTIONS) {
      const link = nav.sectionLink(section.id);
      await expect(link).toBeVisible();
      await expect(link).toHaveText(section.label);
    }
  });

  test("nav items have correct href attributes", async () => {
    const expectedHrefs = {
      products: "/navigation#products-navigation",
      "use-case": "/navigation#use-case-navigation",
      support: "/navigation#support-navigation",
      community: "/navigation#community-navigation",
      "download-ubuntu": "/navigation#download-ubuntu-navigation",
    };
    for (const section of NAV_SECTIONS) {
      const link = nav.sectionLink(section.id);
      await expect(link).toHaveAttribute("href", expectedHrefs[section.id]);
    }
  });

  test("nav items have correct aria-controls attributes", async () => {
    for (const section of NAV_SECTIONS) {
      const link = nav.sectionLink(section.id);
      await expect(link).toHaveAttribute(
        "aria-controls",
        `${section.id}-content`
      );
    }
  });

  test('all links have role="menuitem" and tabindex="0"', async () => {
    for (const section of NAV_SECTIONS) {
      const link = nav.sectionLink(section.id);
      await expect(link).toHaveAttribute("role", "menuitem");
      await expect(link).toHaveAttribute("tabindex", "0");
    }
  });
});
