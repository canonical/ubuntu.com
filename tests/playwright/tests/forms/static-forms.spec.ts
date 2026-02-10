import { test, expect } from "@playwright/test";
import { fillExistingFields, acceptCookiePolicy } from "../../helpers/commands";
import { formTextFields, formCheckboxFields, formRadioFields } from "../../helpers/form-fields";

export const staticContactUsPages = [
  "/tests/_static-client-form",
  "/tests/_static-default-form",
];

test.describe("Form ID validation", () => {
  /**
   * Discover all static contact us pages from the sitemap parser
   * @param page The Playwright page object
   * @returns An array of contact us page URLs
   */

  async function discoverContactUsPages(page) {
    await page.goto('/sitemap_parser');
    const sitemapContent = await page.textContent('body');
    const sitemap = JSON.parse(sitemapContent);

    // Recursive function to retrieve all /contact-us pages, excluding the root /contact-us
    function collectContactUsPages(node, results: string[] = []) {
      if (node.name && node.name !== "/contact-us" && node.name.endsWith("/contact-us")) {
        results.push(node.name);
      }
      if (Array.isArray(node.children)) {
        node.children.forEach(child => collectContactUsPages(child, results));
      }
      return results;
    }

    return collectContactUsPages(sitemap);
  }

  test("should discover and validate all static /contact-us pages", async ({ page }) => {
    const contactUsPages = await discoverContactUsPages(page);
    for (const url of contactUsPages) {
      await test.step(`Validating form on ${url}`, async () => {
        await page.goto(url);
        await acceptCookiePolicy(page);

        // Check that formid and mktoForm input fields are present
        const formIdInput = page.locator('input[name="formid"]');
        await expect(formIdInput).not.toBeEmpty();        
        const form = page.locator('form[id^="mktoForm_"]');
        await expect(form).toBeVisible();
        await page.waitForTimeout(1000);
      
      });
    }
  });
});

test.describe("Form submission validation", () => {
  test("should fill and redirect to marketo submission endpoint", async ({ page }) => {
    for (const url of staticContactUsPages) {
      await test.step(`Testing form on ${url}`, async () => {
        await page.goto(url);
        await acceptCookiePolicy(page);
        await fillExistingFields(page, formTextFields, formCheckboxFields, formRadioFields);

        await page.getByRole("button", { name: /Submit/ }).click();
        await page.waitForURL(/\/marketo\/submit/, { timeout: 10000 });
        await expect(page).toHaveURL('/marketo/submit');

      });
    };
  });

  test("should return 400 error when honeypot is triggered", async ({ page }) => {
    for (const url of staticContactUsPages) {
      await test.step(`Testing form on ${url}`, async () => {
        const responsePromise = page.waitForResponse(response => 
          response.url().includes('/marketo/submit') && response.status() === 400
        );
        await page.goto(url);
        await acceptCookiePolicy(page);
        await fillExistingFields(page, formTextFields, formCheckboxFields, formRadioFields);
    
        // Honeypot fields
        await page.fill('input[name="website"]', 'test');
        await page.fill('input[name="name"]', 'test');
        await page.getByRole("button", { name: /Submit/ }).click();
    
        // Wait for 400 response
        const response = await responsePromise;
        expect(response.status()).toBe(400);

      });
    }
  });

  test("should focus on required field if missing required fields", async ({ page }) => {
    await page.goto("/tests/_static-client-form");
    await acceptCookiePolicy(page);    
    await page.getByRole("button", { name: /Submit/ }).click();

    // Check if the first required field is focused
    const firstRequiredField = page.locator('input[name="company"]');
    await expect(firstRequiredField).toBeFocused();
  });
});

test.describe("Radio field handling", () => {
  test("radio fields should have appropriate js hooks classnames", async ({ page }) => {
    for (const url of staticContactUsPages) {
      await test.step(`Testing form on ${url}`, async () => {
        await page.goto(url);
        await acceptCookiePolicy(page);
    
        // Check that radio has js hooks classnames
        const radioFieldset = page.locator('fieldset.js-remove-radio-names');
        await expect(radioFieldset).toBeVisible();
    
        // Check that radio buttons are present
        const radioButtons = radioFieldset.locator('input[type="radio"]');
        await expect(radioButtons.first()).toBeVisible();
        
        // Check that radio buttons have names starting with _radio_
        const radioName = await radioButtons.first().getAttribute('name');
        expect(radioName).toMatch(/^_radio_/);
      });
    }
    
  });
});

test.describe("Required checkbox validation", () => {
  test("should disable submit button when required checkbox is not checked", async ({ page }) => {    
    await page.goto("/tests/_static-default-form");
    await acceptCookiePolicy(page);

    // Check that submit button is disabled
    const submitButton = page.getByRole("button", { name: /Submit/ });
    await expect(submitButton).toBeDisabled();
  });

  test("should enable submit button when required checkbox is checked", async ({ page }) => {
    await page.goto("/tests/_static-default-form");
    await acceptCookiePolicy(page);

    // Check the required checkbox
    await page.locator('input[aria-labelledby="physical-server"]').check({ force: true });

    const submitButton = page.getByRole("button", { name: /Submit/ });
    await expect(submitButton).toBeEnabled();
  });
});
