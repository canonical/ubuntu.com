import { test, expect } from "@playwright/test";
import { acceptCookiePolicy } from "../helpers/commands";

test.beforeEach(async ({ page }) => {
  await page.goto("/launchpad");
  await acceptCookiePolicy(page);
});

test("Uses the existing global navigation without a Launchpad submenu", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  const navigation = page.locator("#navigation");

  await expect(navigation).not.toHaveClass(/is-reduced/);
  await expect(navigation.locator(".p-navigation__logo-icon")).toBeVisible();
  await expect(
    navigation.getByRole("link", { name: "Canonical Ubuntu", exact: true }),
  ).toBeVisible();
  await expect(
    navigation.getByRole("menuitem", { name: "Products", exact: true }),
  ).toBeVisible();
  await expect(
    navigation.getByRole("menuitem", { name: "Get Ubuntu", exact: true }),
  ).toBeVisible();
  await expect(page.locator("#secondary-navigation")).toHaveCount(0);
});

test("Feature tabs reveal their content with clicks and arrow keys", async ({
  page,
}) => {
  const features = page.locator("#features");
  const tabs = features.getByRole("tab");
  const panels = features.getByRole("tabpanel", { includeHidden: true });

  await expect(tabs).toHaveCount(4);
  await expect(panels.nth(0)).toBeVisible();

  for (let index = 1; index < 4; index++) {
    await tabs.nth(index).click();
    await expect(tabs.nth(index)).toHaveAttribute("aria-selected", "true");
    await expect(panels.nth(index)).toBeVisible();
    await expect(panels.nth(index - 1)).toBeHidden();
  }

  await tabs.nth(3).press("ArrowRight");
  await expect(tabs.nth(0)).toBeFocused();
  await expect(panels.nth(0)).toBeVisible();
  await expect(panels.nth(3)).toBeHidden();

  await tabs.nth(0).press("ArrowLeft");
  await expect(tabs.nth(3)).toBeFocused();
  await expect(panels.nth(3)).toBeVisible();
});

test("Build illustrations stay square without overflowing on mobile or desktop", async ({
  page,
}) => {
  for (const width of [375, 768, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    await expect(
      page.getByRole("heading", { name: "Launchpad", exact: true }),
    ).toBeVisible();

    const images = page.locator("#builds .p-image-container");
    await expect(images).toHaveCount(4);

    for (const image of await images.all()) {
      const container = await image.boundingBox();
      expect(container).not.toBeNull();
      expect(Math.abs(container!.width - container!.height)).toBeLessThan(2);
    }

    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth,
      ),
    ).toBe(true);
  }
});
