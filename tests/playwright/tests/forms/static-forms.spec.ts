import { test, expect, Page } from "@playwright/test";
import { fillExistingFields, acceptCookiePolicy } from "../../helpers/commands";
import { formTextFields, formCheckboxFields, formRadioFields } from "../../helpers/form-fields";

export const staticContactUsPages = [
  "/tests/_static-client-form",
  "/tests/_static-default-form",
];

interface SitemapNode {
  children: SitemapNode[]
  name: string
}

test.describe("Form ID validation", () => {
  /**
   * Discover all static contact us pages from the sitemap parser
   * @param page The Playwright page object
   * @returns An array of contact us page URLs
   */

  async function discoverContactUsPages(page: Page) {
    await page.goto('/sitemap_parser');
    const sitemapContent = await page.textContent('body');
    const sitemap = JSON.parse(sitemapContent!);

    // Recursive function to retrieve all /contact-us pages, excluding the root /contact-us
    function collectContactUsPages(node: SitemapNode, results: string[] = []) {
      if (node.name && node.name !== "/contact-us" && node.name.endsWith("/contact-us")) {
        results.push(node.name);
      }
      if (Array.isArray(node.children)) {
        node.children.forEach((child) => collectContactUsPages(child, results));
      }
      return results;
    }

    return collectContactUsPages(sitemap);
  }

  test("should discover and validate all static /contact-us pages", async ({ page }) => {
    test.setTimeout(10000);
    const contactUsPages = await discoverContactUsPages(page);
    for (const url of contactUsPages) {
      await test.step(`Validating form on ${url}`, async () => {
        await page.goto(url);
        await acceptCookiePolicy(page);

        // Check that formid and mktoForm input fields are present
        const form = page.locator('form[id^="mktoForm_"]').first();
        await expect(form).toBeVisible();
        const formIdInput = form.locator('input[name="formid"]');
        await expect(formIdInput).not.toBeEmpty();
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

test.describe("Hidden field validation", () => {
  const ALLOWED_FIELDS = new Set([
    // User-visible form fields
    "firstname", "lastname", "email", "company", "title",
    "country", "phone",
    "comments_from_lead__c",
    // Click ID tracking fields
    "facebook_click_id__c", "gclid__c",
    // UTM tracking fields
    "utm_content", "utm_term", "utm_medium", "utm_source", "utm_campaign",
    // Form config fields
    "formid", "returnurl", "thankyoumessage", "preferredlanguage",
    "insightsrobotics", "iot_newsletters__c",
    "consent_to_processing__c", "canonicalupdatesoptin",
    // Honeypot fields (blocked server-side)
    "website", "name",
    // JS-injected fields added at runtime
    "user_id", "consent_info", "utms",
  ]);

  test("should not submit unexpected hidden fields", async ({ page }) => {
    await page.goto("/tests/_static-client-form");
    await acceptCookiePolicy(page);
    await fillExistingFields(page, formTextFields, formCheckboxFields, formRadioFields);

    const requestPromise = page.waitForRequest(
      (req) => req.url().includes("/marketo/submit") && req.method() === "POST"
    );

    await page.getByRole("button", { name: /Submit/ }).click();
    const request = await requestPromise;

    const postData = request.postData() ?? "";
    const params = new URLSearchParams(postData);

    for (const key of params.keys()) {
      expect(
        ALLOWED_FIELDS.has(key.toLowerCase()),
        `Unexpected field '${key}' submitted to marketo`
      ).toBe(true);
    }
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
