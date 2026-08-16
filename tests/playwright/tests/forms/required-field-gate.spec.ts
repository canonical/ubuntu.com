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
    await expect(
      form.locator("#required-details-project-name"),
    ).toHaveAttribute("required", "");
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

test.describe("Inline form gating", () => {
  // Scoped to the gated form throughout: the harness page extends the site
  // shell, whose header carries its own button[type=submit] (site search),
  // so an unscoped locator is ambiguous.
  test("button is gated on an untouched form", async ({ page }) => {
    await page.goto(INLINE_FORM);
    const button = page.locator("form[data-required-gate] button[type=submit]");
    await expect(button).toHaveAttribute("aria-disabled", "true");
    await expect(button).toHaveClass(/is-disabled/);
    // Must stay focusable: Playwright's toBeDisabled() treats aria-disabled
    // as disabled, so assert the underlying contract directly instead — no
    // native disabled property/attribute, and still focusable.
    expect(await button.evaluate((el: HTMLButtonElement) => el.disabled)).toBe(
      false,
    );
    await button.focus();
    await expect(button).toBeFocused();
  });

  test("a gated press explains what is missing and does not submit", async ({
    page,
  }) => {
    await page.goto(INLINE_FORM);
    const url = page.url();
    // force: true — a real browser dispatches the click on an aria-disabled
    // (not natively disabled) button; Playwright's actionability checks
    // refuse to, so bypass them to exercise the same path a user would.
    await page
      .locator("form[data-required-gate] button[type=submit]")
      .click({ force: true });

    const summary = page.locator("[data-required-summary]");
    await expect(summary).toContainText("still needed");
    await expect(summary).toContainText("What kind of device are you using?");
    expect(page.url()).toBe(url); // no navigation
  });

  test("a gated press leaves no loading spinner", async ({ page }) => {
    // Regression test for the stopImmediatePropagation contract.
    await page.goto(INLINE_FORM);
    const button = page.locator("form[data-required-gate] button[type=submit]");
    await button.click({ force: true }); // aria-disabled, not natively disabled — see above
    await expect(button).not.toHaveClass(/is-processing/);
    await expect(button).toContainText("Submit");
    await expect(button.locator(".p-icon--spinner")).toHaveCount(0);
  });

  test("focus lands on the summary heading", async ({ page }) => {
    await page.goto(INLINE_FORM);
    await page
      .locator("form[data-required-gate] button[type=submit]")
      .click({ force: true });
    const heading = page.locator("[data-required-summary] h3");
    await expect(heading).toBeFocused();
  });

  test("un-gates once every required answer is supplied", async ({ page }) => {
    // Pre-accept cookies: the site-wide consent banner is fixed to the
    // bottom of the viewport and, once this many fields are filled, sits
    // on top of the below-the-fold radio group — nothing to do with gating.
    await page.context().addCookies([
      {
        name: "_cookies_accepted",
        value: "all",
        domain: "0.0.0.0",
        path: "/",
      },
    ]);
    await page.goto(INLINE_FORM);
    const button = page.locator("form[data-required-gate] button[type=submit]");

    await page.fill("#firstName", "Benjamin");
    await page.fill("#lastName", "Oni");
    await page.fill("#email", "benjo@canonical.com");
    await page.fill("#company", "Canonical");
    await page.fill("#title", "Engineer");
    await page.fill("#required-details-project-name", "Gating");
    await page.selectOption("#required-details-team-size", "1-10");
    await page.fill("#required-details-summary", "Testing the gate.");
    // force: true — these are custom-styled checkboxes/radios whose visible
    // control overlaps the native input's hit target; the rest of this suite
    // (static-forms.spec.ts, form-generator.spec.ts) does the same.
    await page
      .locator("#kind-of-device-field input[type=checkbox]")
      .first()
      .check({ force: true });
    await page
      .locator("#how-many-devices-field input[type=radio]")
      .first()
      .check({ force: true });

    await expect(button).not.toHaveAttribute("aria-disabled", "true");
    await expect(button).not.toHaveClass(/is-disabled/);
  });

  test("a filled-but-malformed email keeps the button gated", async ({
    page,
  }) => {
    await page.goto(INLINE_FORM);
    await page.fill("#email", "benjo@");
    await page
      .locator("form[data-required-gate] button[type=submit]")
      .click({ force: true });
    await expect(page.locator("[data-required-summary]")).toContainText(
      "Email",
    );
  });
});
