import { test, expect } from "@playwright/test";
import { acceptCookiePolicy } from "../helpers/commands";

test.describe("Engage filters", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/engage");
    await acceptCookiePolicy(page);
  });

  test("reveals the filter bar on page load", async ({ page }) => {
    await expect(page.locator("#js-engage-filters")).not.toHaveClass(/u-hide/);
  });

  test("opens a single-select dropdown when its toggle is clicked", async ({
    page,
  }) => {
    const toggle = page
      .locator('.p-filter-menu__toggle[aria-controls="resource-menu"]')
      .first();
    await toggle.click();
    await expect(
      page.locator("#resource-menu"),
    ).toHaveAttribute("aria-hidden", "false");
  });

  test("closes an open dropdown when another toggle is clicked", async ({
    page,
  }) => {
    const resourceToggle = page
      .locator('.p-filter-menu__toggle[aria-controls="resource-menu"]')
      .first();
    const languageToggle = page
      .locator('.p-filter-menu__toggle[aria-controls="language-menu"]')
      .first();

    await resourceToggle.click();
    await languageToggle.click();

    await expect(
      page.locator("#resource-menu"),
    ).toHaveAttribute("aria-hidden", "true");
  });

  test("closes all open dropdowns when clicking outside", async ({ page }) => {
    const toggle = page
      .locator('.p-filter-menu__toggle[aria-controls="resource-menu"]')
      .first();
    await toggle.click();
    await page.locator("body").click({ position: { x: 10, y: 10 } });
    await expect(
      page.locator("#resource-menu"),
    ).toHaveAttribute("aria-hidden", "true");
  });

  test("navigates with resource param only after the submit button is clicked", async ({
    page,
  }) => {
    const toggle = page
      .locator('.p-filter-menu__toggle[aria-controls="resource-menu"]')
      .first();
    await toggle.click();

    const option = page
      .locator(
        '#resource-menu .p-contextual-menu__link[data-value]:not([data-value="all"])',
      )
      .first();

    const paramValue = await option.getAttribute("data-value");
    await option.click();

    // Selection should not navigate until the Apply button is clicked.
    expect(new URL(page.url()).searchParams.has("resource")).toBe(false);

    await page.locator("[data-filter-submit]").click();

    await page.waitForURL((url) =>
      url.searchParams.get("resource") === paramValue,
    );
    expect(new URL(page.url()).searchParams.get("resource")).toBe(paramValue);
  });

  test("removes resource param from URL when 'All' option is selected and submitted", async ({
    page,
  }) => {
    await page.goto("/engage?resource=webinar");
    await acceptCookiePolicy(page);

    const toggle = page
      .locator('.p-filter-menu__toggle[aria-controls="resource-menu"]')
      .first();
    await toggle.click();

    const allOption = page.locator(
      '#resource-menu .p-contextual-menu__link[data-value="all"]',
    );
    await allOption.click();

    // Selection should not navigate until the Apply button is clicked.
    expect(new URL(page.url()).searchParams.get("resource")).toBe("webinar");

    await page.locator("[data-filter-submit]").click();

    await page.waitForURL((url) => !url.searchParams.has("resource"));
    expect(new URL(page.url()).searchParams.has("resource")).toBe(false);
  });

  test("restores single-select toggle label from URL param on load", async ({
    page,
  }) => {
    const resourceOption = page
      .locator(
        '#resource-menu .p-contextual-menu__link[data-value]:not([data-value="all"])',
      )
      .first();

    const paramValue = await resourceOption.getAttribute("data-value");
    const labelText = (await resourceOption.textContent()) ?? "";

    await page.goto(`/engage?resource=${paramValue}`);
    await acceptCookiePolicy(page);

    const toggle = page
      .locator('.p-filter-menu__toggle[aria-controls="resource-menu"]')
      .first();
    await expect(toggle.locator("span")).toHaveText(labelText.trim());
  });

  test("resets page param when a filter is applied", async ({ page }) => {
    await page.goto("/engage?page=3");
    await acceptCookiePolicy(page);

    const toggle = page
      .locator('.p-filter-menu__toggle[aria-controls="resource-menu"]')
      .first();
    await toggle.click();

    const option = page
      .locator(
        '#resource-menu .p-contextual-menu__link[data-value]:not([data-value="all"])',
      )
      .first();
    await option.click();

    // Selection should not navigate until the Apply button is clicked.
    expect(new URL(page.url()).searchParams.get("page")).toBe("3");

    await page.locator("[data-filter-submit]").click();

    await page.waitForURL((url) => !url.searchParams.has("page"));
    expect(new URL(page.url()).searchParams.has("page")).toBe(false);
  });
});

test.describe("Engage tag filters", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/engage");
    await acceptCookiePolicy(page);
  });

  test("opens the tag menu when the tag toggle is clicked", async ({
    page,
  }) => {
    const tagToggle = page.locator(".p-filter-menu__toggle--multi").first();
    await tagToggle.click();
    await expect(
      page.locator("#tag-menu"),
    ).toHaveAttribute("aria-hidden", "false");
  });

  test("shows checked-tag count badge when a tag checkbox is selected", async ({
    page,
  }) => {
    const tagToggle = page.locator(".p-filter-menu__toggle--multi").first();
    await tagToggle.click();

    const firstCheckbox = page
      .locator("#tag-menu .p-filter-menu__checkbox")
      .first();
    // The visible checkbox is the label; clicking it toggles the hidden input.
    await firstCheckbox.locator("~ .p-checkbox__label").click();
    await expect(firstCheckbox).toBeChecked();

    const badge = tagToggle.locator(".p-filter-menu__count");
    await expect(badge).toBeVisible();
    await expect(badge).toHaveText("1");
  });

  test("hides count badge when no tags are checked", async ({ page }) => {
    const tagToggle = page.locator(".p-filter-menu__toggle--multi").first();
    await tagToggle.click();

    const badge = tagToggle.locator(".p-filter-menu__count");
    await expect(badge).toHaveCSS("display", "none");
  });

  test("marks tag label as bold heading when its checkbox is checked", async ({
    page,
  }) => {
    const tagToggle = page.locator(".p-filter-menu__toggle--multi").first();
    await tagToggle.click();

    const firstCheckbox = page
      .locator("#tag-menu .p-filter-menu__checkbox")
      .first();
    // The visible checkbox is the label; clicking it toggles the hidden input.
    await firstCheckbox.locator("~ .p-checkbox__label").click();
    await expect(firstCheckbox).toBeChecked();

    const labelText = firstCheckbox
      .locator("~ .p-checkbox__label .p-filter-menu__label-text")
      .first();
    await expect(labelText).toHaveClass(/p-heading--5/);
  });

  test("select-all button checks every tag checkbox", async ({ page }) => {
    const tagToggle = page.locator(".p-filter-menu__toggle--multi").first();
    await tagToggle.click();

    const selectAll = page.locator("[data-filter-select-all]").first();
    await selectAll.click();

    const checkboxes = page.locator(
      "#tag-menu .p-filter-menu__checkbox",
    );
    const total = await checkboxes.count();
    const checked = await page
      .locator("#tag-menu .p-filter-menu__checkbox:checked")
      .count();
    expect(checked).toBe(total);
  });

  test("clear button unchecks all tag checkboxes", async ({ page }) => {
    const tagToggle = page.locator(".p-filter-menu__toggle--multi").first();
    await tagToggle.click();

    const selectAll = page.locator("[data-filter-select-all]").first();
    await selectAll.click();

    const clearButton = page.locator("[data-filter-clear-selection]").first();
    await clearButton.click();

    const checked = await page
      .locator("#tag-menu .p-filter-menu__checkbox:checked")
      .count();
    expect(checked).toBe(0);
  });

  test("restores tag checkboxes from URL params on load", async ({ page }) => {
    const tagToggle = page.locator(".p-filter-menu__toggle--multi").first();
    await tagToggle.click();

    const firstCheckbox = page
      .locator("#tag-menu .p-filter-menu__checkbox")
      .first();
    const tagValue = await firstCheckbox.getAttribute("value");

    await page.goto(`/engage?tag=${tagValue}`);
    await acceptCookiePolicy(page);

    await page.locator(".p-filter-menu__toggle--multi").first().click();
    await expect(
      page.locator(
        `#tag-menu .p-filter-menu__checkbox[value="${tagValue}"]`,
      ),
    ).toBeChecked();
  });

  test("clicking inside the tag menu does not close it", async ({ page }) => {
    const tagToggle = page.locator(".p-filter-menu__toggle--multi").first();
    await tagToggle.click();

    await page
      .locator("#tag-menu .p-filter-menu__checkbox")
      .first()
      .locator("~ .p-checkbox__label")
      .click();

    await expect(
      page.locator("#tag-menu"),
    ).toHaveAttribute("aria-hidden", "false");
  });
});
