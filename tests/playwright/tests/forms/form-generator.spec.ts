import { test, expect } from "@playwright/test";
import { fillExistingFields, acceptCookiePolicy } from "../../helpers/commands.ts";
import { formTextFields, formCheckboxFields, formRadioFields } from "../../helpers/form-fields.ts";

const openModal = async (page) => {
  await page.goto("/tests/_form-generator");
  await acceptCookiePolicy(page);
  const contactUsLink = page.locator('a[aria-controls="contact-modal"]');
  await expect(contactUsLink).toBeVisible();
  await contactUsLink.click();
  const modal = page.locator("#contact-modal");
  await expect(modal).toBeVisible();
}

test.beforeEach(async ({ page }) => {
  await openModal(page);
});

test.describe("Modal interaction tests", () => {
  test("should open the form generator modal", async ({ page }) => {
  });

  test("should close the modal with close button", async ({ page }) => {
    // Close modal with close button
    const modal = page.locator("#contact-modal");
    const closeButton = modal.locator('button[aria-label="Close active modal"]');
    await expect(closeButton).toBeVisible();
    await closeButton.click();
    await expect(modal).not.toBeVisible();
  });

  test("should close modal with escape key", async ({ page }) => {
    // Close modal with escape key
    await page.keyboard.press('Escape');
    const modal = page.locator("#contact-modal");
    await expect(modal).not.toBeVisible();
  });

  test("should close modal when clicking outside", async ({ page }) => {
    // Close modal when clicking outside
    await page.click('body', { position: { x: 10, y: 10 } });
    const modal = page.locator("#contact-modal");
    await expect(modal).not.toBeVisible();
  });

  test("should restore focus to trigger element after closing", async ({ page }) => {
    await openModal(page);
    const modal = page.locator("#contact-modal");
    
    // Close modal
    const closeButton = modal.locator('button[aria-label="Close active modal"]');
    await closeButton.click();
    
    // Check focus returned to trigger
    const contactUsLink = page.locator('a[aria-controls="contact-modal"]');
    await expect(contactUsLink).toBeFocused();
  });
});

test.describe("Modal validation tests", () => {
  test("should have the correct form ID", async ({ page }) => {
    // Test that the modal contains the form
    const modal = page.locator("#contact-modal");
    const form = modal.locator('form[id^="mktoForm_"]');
    await expect(form).toBeVisible();
  
    // Test that the form has the correct form IDs 
    const formIdInput = modal.locator('input[name="formid"]');
    await expect(formIdInput).toHaveValue("9999");
    const mktoForm = modal.locator('form[id="mktoForm_9999"]');
    await expect(mktoForm).toBeVisible();
  });  

  test("should disable submit button when required checkbox is not checked", async ({ page }) => {
    // Check that submit button is disabled
    const submitButton = page.getByRole("button", { name: /Submit/ });
    await expect(submitButton).toBeDisabled();
  });

  test("should enable submit button when required checkbox is checked", async ({ page }) => {
    // Check the required checkbox
    await page.locator('input[aria-labelledby="physical-server"]').check({ force: true });

    const submitButton = page.getByRole("button", { name: /Submit/ });
    await expect(submitButton).toBeEnabled();
  });

  test("should fill and redirect to marketo submission endpoint", async ({ page }) => {
    await fillExistingFields(page, formTextFields, formCheckboxFields, formRadioFields);

    await page.getByRole("button", { name: /Submit/ }).click();
    await page.waitForURL(/\/marketo\/submit/, { timeout: 10000 });
    await expect(page).toHaveURL('/marketo/submit');
  });

  test("should return 400 error when honeypot is triggered", async ({ page }) => {
    const responsePromise = page.waitForResponse(response =>
      response.url().includes('/marketo/submit') && response.status() === 400
    );
    await fillExistingFields(page, formTextFields, formCheckboxFields, formRadioFields);

    // Honeypot fields
    await page.fill('input[name="website"]', 'test');
    await page.fill('input[name="name"]', 'test');
    await page.getByRole("button", { name: /Submit/ }).click();

    // Wait for 400 response
    const response = await responsePromise;
    expect(response.status()).toBe(400);
  });

  test("should show textbox when 'Other' checkbox is checked", async ({ page }) => {
    // Check the 'Other' checkbox
    const otherCheckbox = page.locator('input[aria-labelledby="other"]');
    await otherCheckbox.check({ force: true });

    // Check that the textarea is visible
    const otherTextarea = page.locator('textarea#other-textarea');
    await expect(otherTextarea).toBeVisible();
  });
});

test("should retain form data when modal is closed and reopened", async ({ page }) => {
  // Fill some fields
  const testFields = [
    { field: 'input[name="company"]', value: 'Test Company' },
    { field: 'input[name="title"]', value: 'Test Title' }
  ]
  for (const { field, value } of testFields) {
    await page.fill(field, value);
  }

  // Close and reopen the modal
  await page.keyboard.press('Escape');
  const contactUsLink = page.locator('a[aria-controls="contact-modal"]');
  await expect(contactUsLink).toBeVisible();
  await contactUsLink.click();
  
  // Check that the fields still have the values
  for (const { field, value } of testFields) {
    const input = page.locator(field);    
    await expect(input).toHaveValue(value);
  }
});
