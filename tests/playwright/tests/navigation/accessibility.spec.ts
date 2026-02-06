import { test, expect } from "@playwright/test";
import { NavigationComponent, NAV_SECTIONS } from "../../helpers/navigation";

test.describe("Keyboard navigation & accessibility", () => {
  let nav: NavigationComponent;

  test.beforeEach(async ({ page }) => {
    nav = new NavigationComponent(page);
    await nav.goto("/");
  });

  test("Tab cycles through nav items in sequence", async () => {
    await nav.sectionLink("products").focus();
    await expect(nav.sectionLink("products")).toBeFocused();

    await nav.page.keyboard.press("Tab");
    await expect(nav.sectionLink("use-case")).toBeFocused();

    await nav.page.keyboard.press("Tab");
    await expect(nav.sectionLink("support")).toBeFocused();
  });

  test("Enter key opens dropdown on focused nav item", async () => {
    const link = nav.sectionLink("products");
    await link.focus();
    await nav.page.keyboard.press("Enter");
    await expect(nav.sectionItem("products")).toHaveClass(/is-active/);
  });

  test("Escape closes open dropdown", async () => {
    await nav.openDropdown("products");

    await expect(nav.sectionItem("products")).toHaveClass(/is-active/);
    await nav.page.keyboard.press("Escape");
    await expect(nav.sectionItem("products")).not.toHaveClass(/is-active/);
  });

  test("all 5 nav links have tabindex=0", async () => {
    for (const section of NAV_SECTIONS) {
      await expect(nav.sectionLink(section.id)).toHaveAttribute(
        "tabindex",
        "0"
      );
    }
  });
});

test.describe("ARIA relationship between menu items and content", () => {
  let nav: NavigationComponent;

  test.beforeEach(async ({ page }) => {
    nav = new NavigationComponent(page);
    await nav.goto("/");
  });

  test("aria-controls target becomes visible when dropdown opens and hidden when closed", async () => {
    const link = nav.sectionLink("products");
    const ariaControls = await link.getAttribute("aria-controls");
    expect(ariaControls).toBe("products-content");

    const controlledContent = nav.page.locator(`#${ariaControls}`);
    await expect(controlledContent).toHaveClass(/u-hide/);

    await nav.openDropdown("products");
    await expect(controlledContent).not.toHaveClass(/u-hide/);

    await nav.dropdownOverlay.click({ force: true });
    await expect(controlledContent).toHaveClass(/u-hide/);
  });
});
