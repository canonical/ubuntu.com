import { test, expect } from "../helpers/fixtures";
import { acceptCookiePolicy } from "../helpers/commands";

test.describe("Certified search results", () => {
  test("should update results per page when pagination is selected", async ({ page }) => {
    await page.goto("/certified/search?q=dell");
    await acceptCookiePolicy(page);
    
    await page.locator('#page-size-bottom').waitFor({ state: 'visible' });
    await page.locator('#page-size-bottom').selectOption({ label: '40' });

    await page.waitForURL(/\/certified\/search\?q=dell&limit=40/, { timeout: 10000 });
    await expect(page).toHaveURL('/certified/search?q=dell&limit=40');
    await expect(page.getByText(/results/)).toContainText('40');
  });

  test("should update results when a filter is selected", async ({ page }) => {
    await page.goto("/certified/search?category=Laptop");
    await acceptCookiePolicy(page);

    // Filters apply automatically: the URL updates, then the page reloads
    await Promise.all([
      page.waitForEvent("load"),
      page.getByLabel('Vendor').getByText('Dell').click(),
    ]);

    await expect(page).toHaveURL(/vendor=Dell/);
    await expect(
      page.locator('.p-certification-results .p-accordion__tab').filter({ hasText: /dell/i }).first()
    ).toBeVisible();
  });

  test("should clear filters when clear is selected", async ({ page }) => {
    await page.goto("/certified/search?category=SoC");
    await acceptCookiePolicy(page);

    await Promise.all([
      page.waitForEvent("load"),
      page.getByText(/20.04 LTS/i).click(),
    ]);
    await expect(page).toHaveURL(/release=20\.04\+LTS/);
    await expect(page.getByLabel('20.04 LTS')).toBeChecked();

    await Promise.all([
      page.waitForEvent("load"),
      page.getByRole("button", { name: "Clear all filters" }).click(),
    ]);
    await expect(page).not.toHaveURL(/release=/);
    await expect(page.getByLabel('20.04 LTS')).not.toBeChecked();
  });
  
  test("should keep query string when filters are cleared", async ({ page }) => {
    await page.goto("/certified/search?q=hp");
    await acceptCookiePolicy(page);

    await page.getByText("Show all versions").click({ force: true });
    await page.waitForSelector('input[type="checkbox"]');
    // No force: the sticky filters footer can cover the checkbox itself
    await Promise.all([
      page.waitForEvent("load"),
      page.getByText(/20.04 LTS/i).click(),
    ]);
    await expect(page).toHaveURL(/release=20\.04\+LTS/);

    await Promise.all([
      page.waitForEvent("load"),
      page.getByRole("button", { name: "Clear all filters" }).click(),
    ]);
    await expect(page).not.toHaveURL(/release=/);
    await expect(page.locator('#certified-search')).toHaveValue("hp");
  });

  test("should take you to search results page when search bar is used", async ({ page }) => {
    await page.goto("/certified");
    await acceptCookiePolicy(page);

    await page.getByPlaceholder('Search', { exact: true }).fill("dell");
    await page.getByRole('button', { name: 'Search' }).click(); 
    
    await page.waitForSelector('text=results', { timeout: 10000 });
    await expect(page.getByText(/results/)).toBeVisible();
    await expect(
      page.locator('.p-certification-results .p-accordion__tab').filter({ hasText: /dell/i }).first()
    ).toBeVisible();
  });
  
});
