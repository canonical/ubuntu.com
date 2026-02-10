import { test, expect } from "../../helpers/fixtures";
import { NAV_SECTIONS } from "../../helpers/navigation";

test.describe("Keyboard navigation & accessibility", () => {
  test("Tab cycles through nav items in sequence", async ({ nav }) => {
    await nav.sectionLink("products").focus();
    await expect(nav.sectionLink("products")).toBeFocused();

    await nav.page.keyboard.press("Tab");
    await expect(nav.sectionLink("use-case")).toBeFocused();

    await nav.page.keyboard.press("Tab");
    await expect(nav.sectionLink("support")).toBeFocused();
  });

  test("Enter key opens dropdown on focused nav item", async ({ nav }) => {
    const link = nav.sectionLink("products");
    await link.focus();
    await nav.page.keyboard.press("Enter");
    await expect(nav.sectionItem("products")).toHaveClass(/is-active/);
  });

  test("Escape closes open dropdown", async ({ nav }) => {
    await nav.openDropdown("products");

    // Focus inside the dropdown content, Escape closes the dropdown.
    await nav.sectionContent("products").locator("a").first().focus();
    await nav.page.keyboard.press("Escape");
    await expect(nav.sectionItem("products")).not.toHaveClass(/is-active/);
  });

  test("all 5 nav links have tabindex=0", async ({ nav }) => {
    for (const section of NAV_SECTIONS) {
      await expect(nav.sectionLink(section.id)).toHaveAttribute(
        "tabindex",
        "0"
      );
    }
  });
});

test.describe("ARIA relationship between menu items and content", () => {
  test("aria-controls target becomes visible when dropdown opens and hidden when closed", async ({ nav }) => {
    const link = nav.sectionLink("products");
    await expect(link).toHaveAttribute("aria-controls", "products-content");

    const controlledContent = nav.sectionContent("products");
    await expect(controlledContent).toHaveClass(/u-hide/);

    await nav.openDropdown("products");
    await expect(controlledContent).not.toHaveClass(/u-hide/);

    await nav.closeDropdownViaOverlay();
    await expect(controlledContent).toHaveClass(/u-hide/);
  });
});
