import { test, expect } from "@playwright/test";
import { fillExistingFields, acceptCookiePolicy } from "../../helpers/commands.ts";
import { formTextFields, formCheckboxFields } from "../../helpers/form-fields.ts";

export const staticContactUsPages = [
  "/tests/_static-client-form",
  "/tests/_static-default-form",
]

test.describe("Form ID validation", () => {
  /**
   * Discover all static contact us pages from the sitemap
   * @param page The Playwright page object
   * @returns An array of contact us page URLs
   */
  async function discoverContactUsPages(page) {
    const contactUsPages: string[] = [];
    await page.goto('https://ubuntu.com/sitemap_tree.xml');
    const sitemapContent = await page.textContent('body');
    const contactUsRegex = /<loc>([^<]+\/contact-us[^<]*)<\/loc>/g;
    let match;

    while ((match = contactUsRegex.exec(sitemapContent)) !== null) {
      const fullPath = match[1];

      const path = new URL(fullPath);
      const pathname = path.pathname;
      if (pathname != '/contact-us') {
        contactUsPages.push(pathname);
      }
    }

    return contactUsPages.length > 0 ? contactUsPages : [];
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
        await fillExistingFields(page, formTextFields, formCheckboxFields);

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
        await fillExistingFields(page, formTextFields, formCheckboxFields);
    
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
    await page.locator('input#physical-server').check({ force: true });

    const submitButton = page.getByRole("button", { name: /Submit/ });
    await expect(submitButton).toBeEnabled();
  });
});