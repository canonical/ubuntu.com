import { test, expect } from "@playwright/test";

export const INLINE_FORM = "/tests/_inline-form-generator";
export const MODAL_FORM = "/tests/_form-generator";
export const TWO_FORM = "/tests/_two-form-generator";

test.describe("Gating harness pages", () => {
  test("inline harness renders a generated form with the full field mix", async ({
    page,
  }) => {
    await page.goto(INLINE_FORM);

    const form = page.locator('form[id^="mktoForm_"]');
    await expect(form).toBeVisible();

    // The fixture must cover every field type the gate has to reason about.
    await expect(form.locator("#required-details-summary")).toHaveAttribute(
      "required",
      "",
    );
    await expect(form.locator("#required-details-team-size")).toHaveAttribute(
      "required",
      "",
    );
    await expect(form.locator("#required-details-project-name")).toHaveAttribute(
      "required",
      "",
    );
    await expect(form.locator("#kind-of-device-field")).toBeAttached();
    await expect(form.locator("#how-many-devices-field")).toBeAttached();
    await expect(form.locator("#email")).toHaveAttribute("type", "email");
  });

  test("modal harness still renders its form", async ({ page }) => {
    await page.goto(MODAL_FORM);
    await page.locator(".js-invoke-modal").first().click();
    await expect(page.locator("#contact-modal form")).toBeVisible();
  });

  test("two-form harness renders an inline form and a modal form", async ({
    page,
  }) => {
    await page.goto(TWO_FORM);

    const inlineForm = page.locator("#mktoForm_9998");
    await expect(inlineForm).toBeVisible();

    await page.locator(".js-invoke-modal").first().click();
    await expect(page.locator("#contact-modal form")).toBeVisible();

    await expect(page.locator(".js-submit-button")).toHaveCount(2);
  });
});
