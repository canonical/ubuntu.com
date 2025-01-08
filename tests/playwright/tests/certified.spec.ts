import { test, expect } from "@playwright/test";
import { acceptCookiePolicy } from "../helpers/commands";

test.describe("Certified search results", () => {
  test("should update results per page when pagination is selected", async ({ page }) => {
    await page.goto("/certified?q=dell");
    await acceptCookiePolicy(page);
    
    await page.locator('#page-size-top').waitFor({ state: 'visible' });
    await page.locator('#page-size-top').selectOption({ label: '40' });

    await page.waitForURL(/\/certified\?q=dell&limit=40/, { timeout: 10000 });
    await expect(page).toHaveURL('/certified?q=dell&limit=40');
    await expect(page.getByText(/results/)).toContainText('40');
  });

  test("should update results when Apply is selected", async ({ page }) => {
    await page.goto("/certified/laptops");
    await acceptCookiePolicy(page);

    await page.getByLabel('Vendor').getByText('Dell').click();
    await page.getByRole("button", { name: /Apply/i }).click();

    await page.waitForSelector('a:has-text("Dell")', { timeout: 10000 });
    expect(page.url().includes('vendor=Dell')).toBe(true);
    await expect(page.getByRole('link', { name: 'Dell' }).first()).toBeVisible();
  });

  test("should clear filters when clear is selected", async ({ page }) => {
    await page.goto("/certified/socs");
    await acceptCookiePolicy(page);

    await page.getByText(/20.04 LTS/i).click();
    await page.getByRole("button", { name: /Apply/i }).click();

    await page.waitForFunction(() => window.location.href.includes('release=20.04+LTS'));
    expect(page.url().includes('release=20.04+LTS')).toBe(true);

    await page.getByRole("button", { name: /Clear/i }).click();
    await page.waitForFunction(() => !window.location.href.includes('release=20.04+LTS'));
    expect(page.url().includes('release=20.04+LTS')).toBe(false);
    await expect(page.getByLabel('20.04 LTS')).not.toBeChecked();
  });
  
  test("should keep query string when filters are cleared", async ({ page }) => {
    await page.goto("/certified?q=hp");
    await acceptCookiePolicy(page);

    await page.getByText("Show all versions").click({ force: true });
    await page.waitForSelector('input[type="checkbox"]');
    await page.getByRole("checkbox", { name: /20.04 LTS/i }).click({ force: true });
    await page.getByRole("button", { name: /Apply/i }).click({ force: true });
    await page.getByRole("button", { name: /Clear/i }).click({ force: true });
    await expect(page.getByPlaceholder('Search', { exact: true })).toHaveValue("hp");
  });

  test("should take you to search results page when search bar is used", async ({ page }) => {
    await page.goto("/certified");
    await acceptCookiePolicy(page);

    await page.getByPlaceholder('Search', { exact: true }).fill("dell");
    await page.getByRole('button', { name: 'Search' }).click(); 
    
    await page.waitForSelector('text=results', { timeout: 10000 });
    await expect(page.getByText(/results/)).toBeVisible();
    await expect(page.getByRole('link', { name: 'Dell' }).first()).toBeVisible();
  });
  
});
