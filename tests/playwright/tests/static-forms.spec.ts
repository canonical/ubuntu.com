import { test, expect } from "@playwright/test";
import { acceptCookiePolicy } from "../helpers/commands";

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

        // Only accept cookie policy if it exists
        if (await page.locator('#cookie-policy-button-accept').isVisible()) {
          await acceptCookiePolicy(page);
        }

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
  test("should return success response code when form is submitted successfully", async ({ page }) => {
    const responsePromise = page.waitForResponse(response => 
      response.url().includes('/marketo/submit') && response.status() !== 400
    );
    await page.goto("/core/contact-us");
    await acceptCookiePolicy(page);
    
    // Fill required fields
    await page.fill('input[name="company"]', 'Test Company');
    await page.fill('input[name="title"]', 'Test Title');
    await page.fill('textarea[id="comments"]', 'Test comments');
    await page.getByLabel("< 5 machines").check({ force: true });
    await page.fill('input[name="firstName"]', 'Test first name');
    await page.fill('input[name="lastName"]', 'Test last name');
    await page.fill('input[name="email"]', 'test@test.com');
    await page.getByLabel('I agree to receive information').check({ force: true });
    
    await page.getByRole("button", { name: /Submit/ }).click();

    // Wait for successful/redirect responses
    const response = await responsePromise;
    expect([200, 302]).toContain(response.status());
    
  });

  test("should return 400 error when honeypot is triggered", async ({ page }) => {
    const responsePromise = page.waitForResponse(response => 
      response.url().includes('/marketo/submit') && response.status() === 400
    );
    await page.goto("/core/contact-us");
    await acceptCookiePolicy(page);    

    await page.fill('input[name="company"]', 'Test Company');
    await page.fill('input[name="title"]', 'Test Title');
    await page.fill('textarea[id="comments"]', 'Test comments');
    await page.getByLabel("< 5 machines").check({ force: true });
    await page.fill('input[name="firstName"]', 'Test first name');
    await page.fill('input[name="lastName"]', 'Test last name');
    await page.fill('input[name="email"]', 'test@test.com');
    await page.getByLabel('I agree to receive information').check({ force: true });

    // Honeypot fields
    await page.fill('input[name="website"]', 'test');
    await page.fill('input[name="name"]', 'test');
    await page.getByRole("button", { name: /Submit/ }).click();

    // Wait for 400 response
    const response = await responsePromise;
    expect(response.status()).toBe(400);
  });

  test("should focus to required field if missing required fields", async ({ page }) => {
    await page.goto("/core/contact-us");
    await acceptCookiePolicy(page);    
    await page.getByRole("button", { name: /Submit/ }).click();

    // Check if the first required field is focused
    const firstRequiredField = page.locator('input[name="company"]');
    await expect(firstRequiredField).toBeFocused();
  });
});

test.describe("Email validation", () => {
  const invalidEmails = [
    { email: 'invalid-email', expectedMessage: "Please include an '@'" },
    { email: 'test@', expectedMessage: "Please enter a part following '@'" },
    { email: 'test@invalid', expectedMessage: "Please match the requested format" },
    { email: '@invalid.com', expectedMessage: "Please enter a part followed by '@'" }
  ];

  invalidEmails.forEach(({ email, expectedMessage }) => {
    test(`should show validation message for ${email}`, async ({ page }) => {
      await page.goto("/core/contact-us");
      await acceptCookiePolicy(page);

      // Fill required fields
      await page.fill('input[name="company"]', 'Test Company');
      await page.fill('input[name="title"]', 'Test Title');
      await page.fill('textarea[id="comments"]', 'Test comments');
      await page.getByLabel("< 5 machines").check({ force: true });
      await page.fill('input[name="firstName"]', 'John');
      await page.fill('input[name="lastName"]', 'Doe');
      
      // Fill invalid email
      await page.fill('input[name="email"]', email);

      // Check validation message
      await page.getByRole("button", { name: /Submit/ }).click();
      const emailField = page.locator('input[name="email"]');
      const validationMessage = await emailField.evaluate(el => {
        if (el instanceof HTMLInputElement) {
          return el.validationMessage;
        }
        return '';
      });
      
      expect(validationMessage).toContain(expectedMessage);
      await expect(emailField).toHaveJSProperty("validity.valid", false);
    });
  });
});

test.describe("Radio field handling", () => {
  test("radio fields should have appropriate js hooks classnames", async ({ page }) => {
    await page.goto("/core/contact-us");
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
});

test.describe("Required checkbox validation", () => {
  test("should disable submit button when required checkbox is not checked", async ({ page }) => {
    await page.goto("/ai/contact-us");
    await acceptCookiePolicy(page);

    // Check that submit button is disabled
    const submitButton = page.getByRole("button", { name: /Submit/ });
    await expect(submitButton).toBeDisabled();
  });

  test("should enable submit button when required checkbox is checked", async ({ page }) => {
    await page.goto("/ai/contact-us");
    await acceptCookiePolicy(page);

    // Check the required checkbox
    await page.getByLabel('Physical server').check({ force: true });

    const submitButton = page.getByRole("button", { name: /Submit/ });
    await expect(submitButton).toBeEnabled();
  });
});