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

test.describe("Template markers", () => {
  test("generated form carries the opt-in marker and question markers", async ({
    page,
  }) => {
    await page.goto(INLINE_FORM);
    const form = page.locator("form[data-required-gate]");
    await expect(form).toBeVisible();

    // Required fieldsets are marked; optional ones are not.
    await expect(
      form.locator("#kind-of-device-field[data-required-question]"),
    ).toBeAttached();
    await expect(
      form.locator("#how-many-devices-field[data-required-question]"),
    ).toBeAttached();
    await expect(
      form.locator("#required-details-field[data-required-question]"),
    ).toBeAttached();
    await expect(
      form.locator("#ubuntu-versions-field[data-required-question]"),
    ).toHaveCount(0);
  });

  test("summary container is present, empty and adjacent to the submit button", async ({
    page,
  }) => {
    await page.goto(INLINE_FORM);
    const summary = page.locator("[data-required-summary]");
    await expect(summary).toHaveAttribute("role", "alert");
    await expect(summary).toBeEmpty();
    await expect(summary).toHaveAttribute("id", /^required-field-summary-/);
  });

  test("select label and select input agree about required-ness", async ({
    page,
  }) => {
    await page.goto(INLINE_FORM);
    // field.isRequired: true -> label marked required
    await expect(
      page.locator('label[for="required-details-team-size"]'),
    ).toHaveClass(/is-required/);
    // field.isRequired absent, but its fieldset IS required. Before the fix the
    // label read fieldset.isRequired and wrongly showed as required.
    await expect(
      page.locator('label[for="required-details-referral"]'),
    ).not.toHaveClass(/is-required/);
  });

  test.describe("No gated styling is server-rendered", () => {
    test.use({ javaScriptEnabled: false });

    test("form and button carry no gating attributes without JS", async ({
      page,
    }) => {
      await page.goto(INLINE_FORM);
      const form = page.locator("form[data-required-gate]");
      await expect(form).toBeVisible();
      await expect(form).not.toHaveAttribute("novalidate", /.*/);

      const button = form.locator("button[type=submit]");
      await expect(button).not.toHaveAttribute("aria-disabled", /.*/);
      await expect(button).not.toHaveClass(/is-disabled/);
      await expect(button).not.toBeDisabled();
    });
  });
});
