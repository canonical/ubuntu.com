import { test, expect } from "@playwright/test";
import { selectProducts, acceptCookiePolicy, getCookies } from "../../helpers/commands";
import { customerInfoResponse, previewResponse } from "../../helpers/mockData";
import { ENDPOINTS } from "../../helpers/utils";

test.describe("Checkout - Region and taxes", () => {
  test("It should show correct non-VAT price", async ({page, context}) => {
    await getCookies({context});
    await page.goto("/pro/subscribe")
    await acceptCookiePolicy(page)
    await selectProducts(page);
    await page.getByRole("button", { name: "Buy now" }).click();

    await page.click('button[type="submit"]') // login with saved cookies
    await expect(page).toHaveURL('/account/checkout');
    
    await page.route(ENDPOINTS.customerInfo,  async (route) => {
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({...customerInfoResponse, "customerInfo": {...customerInfoResponse.customerInfo, "address": {...customerInfoResponse.customerInfo.address, "country": "AF" }}})
      });
    });

    await page.route(ENDPOINTS.preview,  async (route) => {
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(previewResponse)
      });
    });
   
    await page.locator(
      ":nth-child(1) > .p-stepped-list__content > .row > .u-align--right > .p-action-button"
    ).click(); // Click "Edit" button
    await page.getByLabel("Country/Region:").selectOption({ label: 'Afghanistan' })
    await page.locator(".u-align--right > :nth-child(2)").click(); // Click "Save" button

    const country = await page.$('[data-testid="country"]')
    const countryText = await country?.innerText();

    expect(countryText).toBe("Afghanistan")
    expect(await page.$('[data-testid="total"]')).toBeNull();
    expect(await page.$('[data-testid="tax"]')).toBeNull();
  })
})
