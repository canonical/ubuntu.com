import { test, expect } from "@playwright/test";
import { acceptCookiePolicy } from "../helpers/commands";

test.describe("Certified search results", () => {
  test("should update results per page when pagination is selected", async ({page}) => {
    await page.goto("/certified?q=dell")
    await acceptCookiePolicy(page)
    await page.locator('#page-size-top').selectOption({ label: '40' });
    await expect(page).toHaveURL('/certified?q=dell&limit=40')
    await expect(page.getByText(/results/)).toContainText('40');
  });

  test("should update results when Apply is selected", async ({page}) => {
    await page.goto("/certified/laptops");
    await acceptCookiePolicy(page)
    await page.waitForLoadState('networkidle');
    await page.getByLabel('Vendor').getByText('Dell').click();
    await page.getByRole("button", { name: /Apply/i }).click();
    await page.waitForLoadState('networkidle');
    expect(page.url().includes('vendor=Dell')).toBe(true);
    await expect(page.getByRole('link', { name: 'Dell' }).first()).toBeVisible();
  });

  test("should clear filters when clear is selected", async ({page}) => {
    await page.goto("/certified/socs");
    await acceptCookiePolicy(page)
    await page.waitForLoadState('networkidle');
    await page.getByText(/20.04 LTS/i).click();
    await page.getByRole("button", { name: /Apply/i }).click();
    await page.waitForLoadState('networkidle');
    expect(page.url().includes('release=20.04+LTS')).toBe(true);
    await page.getByRole("button", { name: /Clear/i }).click();
    await page.waitForLoadState('networkidle');
    expect(page.url().includes('release=20.04+LTS')).toBe(false);
    expect(await page.getByLabel('20.04 LTS').isChecked()).toBe(false);
  });
  
  test("should keep query string when filters are cleared", async ({page}) => {
    await page.goto("/certified?q=hp");
    await acceptCookiePolicy(page)
    await page.getByText("Show all versions").click({ force: true });
    await page.getByRole("checkbox", { name: /20.04 LTS/i }).click({ force: true });
    await page.getByRole("button", { name: /Apply/i }).click({ force: true });
    await page.getByRole("button", { name: /Clear/i }).click({ force: true });
    await expect(page.getByPlaceholder('Search', { exact: true })).toHaveValue("hp");
  });

  test("should take you to seach results page when search bar is used",  async ({page}) => {
    await page.goto("/certified");
    await acceptCookiePolicy(page)
    await page.getByPlaceholder('Search', { exact: true }).fill("dell")
    await page.getByText('Search', { exact: true }).click()
    await expect(page.getByText(/results/)).toBeVisible()
    await expect(page.getByRole('link', { name: 'Dell' }).first()).toBeVisible();
  });
})
