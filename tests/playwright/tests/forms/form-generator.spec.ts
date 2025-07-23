import { test, expect } from "@playwright/test";
import { fillExistingFields, acceptCookiePolicy } from "../../helpers/commands.ts";

const openModal = async (page) => {
  await page.goto("/tests/_form-generator");
  await acceptCookiePolicy(page);
  const contactUsLink = page.locator('a[aria-controls="contact-modal"]');
  await expect(contactUsLink).toBeVisible();
  await contactUsLink.click();
  const modal = page.locator("#contact-modal");
  await expect(modal).toBeVisible();
}

test.describe("Form generator dummy modal tests", () => {
  test("should open the form generator modal", async ({ page }) => {
    await openModal(page);    
  });

  test("should close the form generator modal", async ({ page }) => {
    await openModal(page);

    // Close modal
    const modal = page.locator("#contact-modal");
    await expect(modal).toBeVisible();
    const closeButton = modal.locator('button[aria-label="Close active modal"]');
    await expect(closeButton).toBeVisible();
    await closeButton.click();
    await expect(modal).not.toBeVisible();
  });
  
  test("should have the correct form ID", async ({ page }) => {
    await openModal(page);
  
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

  // Test that the form fields behave as expected
});



// Check all form-data.json files, check that the modal opens
