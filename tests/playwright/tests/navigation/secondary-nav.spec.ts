import { test, expect } from "@playwright/test";
import { NavigationComponent } from "../../helpers/navigation";

test.describe("Secondary navigation", () => {
  let nav: NavigationComponent;

  test.beforeEach(async ({ page }) => {
    nav = new NavigationComponent(page);
  });

  test("/azure page shows secondary navigation with title Azure", async () => {
    await nav.goto("/azure");

    await expect(nav.secondaryNav).toBeVisible();
    await expect(nav.secondaryNavTitle).toContainText("Azure");
  });

  test("/azure page has expected child items", async () => {
    await nav.goto("/azure");

    const expectedItems = ["Pro", "Support", "FIPS", "SQL", "Docs"];
    for (const item of expectedItems) {
      await expect(
        nav.secondaryNav.getByRole("link", { name: item }).first()
      ).toBeVisible();
    }
  });

  test("/azure/pro shows Pro as selected with aria-current", async () => {
    await nav.goto("/azure/pro");

    await expect(nav.secondaryNavSelectedItem).toContainText("Pro");
    await expect(nav.secondaryNavSelectedItem.locator("a")).toHaveAttribute(
      "aria-current",
      "page"
    );
  });

  test("/pro page shows secondary nav with title Ubuntu Pro", async () => {
    await nav.goto("/pro");

    await expect(nav.secondaryNav).toBeVisible();
    await expect(nav.secondaryNavTitle).toContainText("Ubuntu\u00a0Pro");
  });

  test("/openstack page shows secondary nav with OpenStack branding", async () => {
    await nav.goto("/openstack");

    await expect(nav.secondaryNav).toBeVisible();
    await expect(nav.secondaryNavTitle).toContainText("OpenStack");
  });

  test("homepage does not show secondary navigation", async () => {
    await nav.goto("/");

    await expect(nav.secondaryNav).toHaveCount(0);
  });
});
