import { test, expect, Page } from "@playwright/test";
import { fillExistingFields, acceptCookiePolicy } from "../../helpers/commands";
import { formTextFields, modalFormCheckboxFields, modalFormRadioFields } from "../../helpers/form-fields";

const openModal = async (page: Page) => {
  await page.goto("/tests/_form-generator");
  await acceptCookiePolicy(page);
  const contactUsLink = page.locator('a[aria-controls="contact-modal"]');
  await expect(contactUsLink).toBeVisible();
  await contactUsLink.click();
  const modal = page.locator("#contact-modal");
  await expect(modal).toBeVisible();
};

test.beforeEach(async ({ page }) => {
  await openModal(page);
});

test.describe("Modal interaction tests", () => {
  test("should open the form generator modal", async () => {
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
    const modal = page.locator("#contact-modal");
    const submitButton = modal.getByRole("button", { name: /Submit/ });
    await expect(submitButton).toBeDisabled();
  });

  test("should enable submit button when required checkbox is checked", async ({ page }) => {
    // Check the required checkbox (scoped to modal)
    const modal = page.locator("#contact-modal");
    await modal.locator('input[aria-label="physical-server"]').check({ force: true });

    const submitButton = modal.getByRole("button", { name: /Submit/ });
    await expect(submitButton).toBeEnabled();
  });

  test("should fill and redirect to marketo submission endpoint", async ({ page }) => {
    const modal = page.locator("#contact-modal");
    await fillExistingFields(modal, formTextFields, modalFormCheckboxFields, modalFormRadioFields);

    await modal.getByRole("button", { name: /Submit/ }).click();
    await page.waitForURL(/\/marketo\/submit/, { timeout: 10000 });
    await expect(page).toHaveURL('/marketo/submit');
  });

  test("should return 400 error when honeypot is triggered", async ({ page }) => {
    const responsePromise = page.waitForResponse(response =>
      response.url().includes('/marketo/submit') && response.status() === 400
    );
    const modal = page.locator("#contact-modal");
    await fillExistingFields(modal, formTextFields, modalFormCheckboxFields, modalFormRadioFields);

    // Honeypot fields
    await modal.locator('input[name="website"]').fill('test');
    await modal.locator('input[name="name"]').fill('test');
    await modal.getByRole("button", { name: /Submit/ }).click();

    // Wait for 400 response
    const response = await responsePromise;
    expect(response.status()).toBe(400);
  });

  test("should show textbox when 'Other' radio is selected", async ({ page }) => {
    // Select the 'Other' radio option (scoped to modal)
    const modal = page.locator("#contact-modal");
    const otherRadio = modal.locator('input[aria-label="other"]');
    await otherRadio.check({ force: true });

    // Check that the textarea is visible
    const otherTextarea = modal.locator('textarea#other-textarea');
    await expect(otherTextarea).toBeVisible();
  });
});

test("should retain form data when modal is closed and reopened", async ({ page }) => {
  // Fill some fields
  const testFields = [
    { field: 'input[name="company"]', value: 'Test Company' },
    { field: 'input[name="title"]', value: 'Test Title' }
  ];
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
