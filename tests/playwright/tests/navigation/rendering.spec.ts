import { test, expect } from "../../helpers/fixtures";
import { NAV_SECTIONS } from "../../helpers/navigation";

test.describe("Navigation rendering", () => {
  test("main navigation header renders with correct classes", async ({ nav }) => {
    await expect(nav.header).toBeVisible();
    await expect(nav.header).toHaveClass(/is-dark/);
  });

  test("logo links to / with text Canonical Ubuntu", async ({ nav }) => {
    await expect(nav.logoLink).toHaveAttribute("href", "/");
    await expect(nav.logoLink).toContainText("Canonical Ubuntu");
  });

  test("dropdown-window container exists with 5 empty content divs", async ({ nav }) => {
    await expect(nav.dropdownWindow).toBeAttached();

    for (const section of NAV_SECTIONS) {
      const contentDiv = nav.sectionContent(section.id);
      await expect(contentDiv).toBeAttached();
      await expect(contentDiv).toHaveClass(/u-hide/);
    }
  });

  test("dropdown-window-overlay exists", async ({ nav }) => {
    await expect(nav.dropdownOverlay).toBeAttached();
  });
});

test.describe("Top-level navigation items", () => {
  test("all 5 nav items visible with correct text", async ({ nav }) => {
    for (const section of NAV_SECTIONS) {
      const link = nav.sectionLink(section.id);
      await expect(link).toBeVisible();
      await expect(link).toHaveText(section.label);
    }
  });

  test("nav items have correct href attributes", async ({ nav }) => {
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

  test("nav items have correct aria-controls attributes", async ({ nav }) => {
    for (const section of NAV_SECTIONS) {
      const link = nav.sectionLink(section.id);
      await expect(link).toHaveAttribute(
        "aria-controls",
        `${section.id}-content`
      );
    }
  });

  test('all links have role="menuitem" and tabindex="0"', async ({ nav }) => {
    for (const section of NAV_SECTIONS) {
      const link = nav.sectionLink(section.id);
      await expect(link).toHaveAttribute("role", "menuitem");
      await expect(link).toHaveAttribute("tabindex", "0");
    }
  });
});
