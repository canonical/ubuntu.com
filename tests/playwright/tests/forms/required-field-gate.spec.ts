import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

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
    const heading = page.locator("[data-required-summary] h2");
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

test.describe("Modal form gating", () => {
  // Pre-accept cookies for every test in this block: the site-wide consent
  // banner is fixed to the bottom of the viewport and the modal's submit
  // button sits near the bottom of a long modal, so the banner physically
  // overlaps it. Playwright's force:true click bypasses actionability
  // checks but still dispatches at real coordinates, so an unaccepted
  // banner silently swallows the click — same root cause as the inline
  // suite's "un-gates" test above, but it affects every click here because
  // of the modal's layout, not just field-heavy tests.
  test.beforeEach(async ({ page }) => {
    await page.context().addCookies([
      {
        name: "_cookies_accepted",
        value: "all",
        domain: "0.0.0.0",
        path: "/",
      },
    ]);
  });

  async function openModal(page) {
    await page.goto(MODAL_FORM);
    await page.locator(".js-invoke-modal").first().click();
    await expect(page.locator("#contact-modal")).toBeVisible();
    return page.locator("#contact-modal form");
  }

  test("button is gated when the modal opens", async ({ page }) => {
    const form = await openModal(page);
    const button = form.locator("button[type=submit]");
    await expect(button).toHaveAttribute("aria-disabled", "true");
    // Must stay focusable: Playwright's toBeDisabled()/not.toBeDisabled()
    // treats aria-disabled as disabled (elementState() -> getAriaDisabled(),
    // which fires for role=button), so it can never pass here. Assert the
    // underlying contract directly instead, as the inline suite does above.
    expect(await button.evaluate((el: HTMLButtonElement) => el.disabled)).toBe(
      false,
    );
    await button.focus();
    await expect(button).toBeFocused();
  });

  test("a gated press explains what is missing inside the modal", async ({
    page,
  }) => {
    const form = await openModal(page);
    // force: true — aria-disabled, not natively disabled; see above.
    await form.locator("button[type=submit]").click({ force: true });
    await expect(form.locator("[data-required-summary]")).toContainText(
      "still needed",
    );
  });

  test("re-opening recomputes rather than assuming a blank form", async ({
    page,
  }) => {
    const form = await openModal(page);
    await form
      .locator("#kind-of-device-field input[type=checkbox]")
      .first()
      .check({ force: true });

    await page.locator("#contact-modal .js-close").first().click();
    await page.locator(".js-invoke-modal").first().click();

    // The tick is retained, so that question must not be listed again.
    await form.locator("button[type=submit]").click({ force: true });
    await expect(form.locator("[data-required-summary]")).not.toContainText(
      "What kind of device are you using?",
    );
  });

  test("listeners do not accumulate across open/close cycles", async ({
    page,
  }) => {
    // The original version of this test asserted a single rendered <h3> on
    // a gated press, which cannot fail regardless of whether destroy() is
    // ever wired: initRequiredFieldGate() self-destroys any prior handle on
    // the same physical <form> node (the modal reuses that node across
    // opens, which is also why field values persist), so leaked handlers
    // never accumulate to begin with; and even N leaked submit listeners
    // would still render exactly one <h3>, because the first one to run
    // calls stopImmediatePropagation(), which — per the DOM spec — stops
    // every other listener on that node, and renderSummary() clears the
    // summary before appending. Neither path exercises destroy()-in-close().
    //
    // Instead, instrument window.addEventListener/removeEventListener to
    // track the net count of "pageshow" listeners — the one listener the
    // gate registers on `window` (not on the form), which destroy() is
    // responsible for removing. Take a baseline reading before the first
    // open (other code may register its own pageshow listeners, so don't
    // assume zero), run several full open/close cycles, and assert the net
    // count returns to that baseline rather than growing per cycle.
    await page.addInitScript(() => {
      (window as any).__pageshowNet = 0;
      const add = window.addEventListener.bind(window);
      const remove = window.removeEventListener.bind(window);
      window.addEventListener = function (type: string, ...rest: any[]) {
        if (type === "pageshow") (window as any).__pageshowNet++;
        return (add as any)(type, ...rest);
      };
      window.removeEventListener = function (type: string, ...rest: any[]) {
        if (type === "pageshow") (window as any).__pageshowNet--;
        return (remove as any)(type, ...rest);
      };
    });

    await page.goto(MODAL_FORM);
    const baseline = await page.evaluate(() => (window as any).__pageshowNet);

    for (let i = 0; i < 4; i++) {
      await page.locator(".js-invoke-modal").first().click();
      await expect(page.locator("#contact-modal")).toBeVisible();
      await page.locator("#contact-modal .js-close").first().click();
    }

    const afterCycles = await page.evaluate(
      () => (window as any).__pageshowNet,
    );
    expect(afterCycles).toBe(baseline);
  });

  test("un-gates once every required answer is supplied", async ({ page }) => {
    const form = await openModal(page);
    const button = form.locator("button[type=submit]");

    await form.locator("#firstName").fill("Benjamin");
    await form.locator("#lastName").fill("Oni");
    await form.locator("#email").fill("benjo@canonical.com");
    await form.locator("#company").fill("Canonical");
    await form.locator("#title").fill("Engineer");
    await form.locator("#required-details-project-name").fill("Gating");
    await form.locator("#required-details-team-size").selectOption("1-10");
    await form.locator("#required-details-summary").fill("Testing the gate.");
    // force: true — these are custom-styled checkboxes/radios whose visible
    // control overlaps the native input's hit target; same precedent as the
    // inline suite above (and static-forms.spec.ts, form-generator.spec.ts).
    await form
      .locator("#kind-of-device-field input[type=checkbox]")
      .first()
      .check({ force: true });
    await form
      .locator("#how-many-devices-field input[type=radio]")
      .first()
      .check({ force: true });

    await expect(button).not.toHaveAttribute("aria-disabled", "true");
    await expect(button).not.toHaveClass(/is-disabled/);
  });
});

test.describe("Opt-in scoping", () => {
  test("the default contact-us form is gated", async ({ page }) => {
    await page.goto("/tests/_static-default-form");
    const button = page.locator("form[data-required-gate] button[type=submit]");
    await expect(button).toHaveAttribute("aria-disabled", "true");
    expect(await button.evaluate((el: HTMLButtonElement) => el.disabled)).toBe(
      false,
    );
    await button.focus();
    await expect(button).toBeFocused();

    await button.click({ force: true });
    await expect(page.locator("[data-required-summary]")).toContainText(
      "What kind of device are you using?",
    );
  });

  test("the default contact-us form un-gates once every required answer is supplied", async ({
    page,
  }) => {
    // The inline/modal "un-gates" tests exercise the generated fixture
    // forms, not this template. _default-contact-us-form.html has a
    // different field mix — no required-details project/team/summary
    // fields, an unmarked (no id) required checkbox fieldset, and a native
    // `required` radio (input[name="_radio_how-many-machines-do-you-have"])
    // instead of a data-required-question fieldset — so it needs its own
    // coverage that this template genuinely opens once answered.
    await page.context().addCookies([
      {
        name: "_cookies_accepted",
        value: "all",
        domain: "0.0.0.0",
        path: "/",
      },
    ]);
    await page.goto("/tests/_static-default-form");
    const form = page.locator("form[data-required-gate]");
    const button = form.locator("button[type=submit]");
    await expect(button).toHaveAttribute("aria-disabled", "true");

    await form.locator("#firstName").fill("Benjamin");
    await form.locator("#lastName").fill("Oni");
    await form.locator("#company").fill("Canonical");
    await form.locator("#title").fill("Engineer");
    await form.locator("#email").fill("benjo@canonical.com");
    // force: true — custom-styled checkbox/radio, same precedent as the
    // rest of this suite.
    await form
      .locator("fieldset[data-required-question] input[type=checkbox]")
      .first()
      .check({ force: true });
    await form
      .locator('input[name="_radio_how-many-machines-do-you-have"]')
      .first()
      .check({ force: true });

    await expect(button).not.toHaveAttribute("aria-disabled", "true");
    await expect(button).not.toHaveClass(/is-disabled/);
  });

  test("a hand-written form without the marker is not gated", async ({
    page,
  }) => {
    // The guard against shipping a behaviour change to unexamined templates.
    await page.goto("/tests/_static-client-form");
    const form = page.locator("form[action='/marketo/submit']").first();
    await expect(form).not.toHaveAttribute("data-required-gate", /.*/);
    await expect(form.locator("button[type=submit]")).not.toHaveAttribute(
      "aria-disabled",
      "true",
    );
  });
});

test.describe("Accessibility of the gated state", () => {
  test("gated form has no axe violations", async ({ page }) => {
    await page.goto(INLINE_FORM);
    const results = await new AxeBuilder({ page })
      .include("form[data-required-gate]")
      .analyze();
    expect(results.violations).toEqual([]);
  });

  test("summary after a failed press has no axe violations", async ({
    page,
  }) => {
    await page.goto(INLINE_FORM);
    // force: true — aria-disabled, not natively disabled; see the "Inline
    // form gating" block above.
    await page
      .locator("form[data-required-gate] button[type=submit]")
      .click({ force: true });
    const results = await new AxeBuilder({ page })
      .include("form[data-required-gate]")
      .analyze();
    expect(results.violations).toEqual([]);
  });

  test("the gated button is keyboard reachable and announces its state", async ({
    page,
  }) => {
    // Axe will happily pass a button that is focusable and says nothing useful,
    // so assert the mechanism directly.
    await page.goto(INLINE_FORM);
    const button = page.locator("form[data-required-gate] button[type=submit]");

    await button.focus();
    await expect(button).toBeFocused();
    await expect(button).toHaveAttribute("aria-disabled", "true");

    const describedBy = await button.getAttribute("aria-describedby");
    expect(describedBy).toBeTruthy();
    await expect(page.locator(`#${describedBy}`)).toHaveAttribute(
      "role",
      "alert",
    );
  });

  test("a summary link moves focus to the question it names", async ({
    page,
  }) => {
    await page.goto(INLINE_FORM);
    await page
      .locator("form[data-required-gate] button[type=submit]")
      .click({ force: true });
    await page
      .locator("[data-required-summary] a", {
        hasText: "What kind of device are you using?",
      })
      .click();
    // This exercises focusTarget's FIELDSET branch: the summary entry's
    // target is the "kind of device" fieldset (a required checkbox
    // question, not a single control), so the assertion must land on an
    // actual focusable control inside it — the first checkbox — not merely
    // confirm the link exists.
    await expect(
      page.locator("#kind-of-device-field input[type=checkbox]").first(),
    ).toBeFocused();
  });
});

test.describe("The no-JS floor", () => {
  test.use({ javaScriptEnabled: false });

  test("the button is neither muted nor disabled with JS off", async ({
    page,
  }) => {
    await page.goto(INLINE_FORM);
    const button = page.locator("form[data-required-gate] button[type=submit]");
    await expect(button).not.toHaveAttribute("aria-disabled", /.*/);
    await expect(button).not.toHaveClass(/is-disabled/);
    // Not the R10 substitution: with JS off there is no aria-disabled at
    // all, so Playwright's aria-disabled-aware toBeDisabled() is exactly
    // the right check here — this block asserts the absence of gating.
    await expect(button).not.toBeDisabled();
    await expect(page.locator("form[data-required-gate]")).not.toHaveAttribute(
      "novalidate",
      /.*/,
    );
  });

  test("native validation blocks an empty required text field", async ({
    page,
  }) => {
    await page.goto(INLINE_FORM);
    const url = page.url();
    await page.locator("form[data-required-gate] button[type=submit]").click();
    expect(page.url()).toBe(url); // browser refused to submit
  });

  test("native validation blocks a required radio group", async ({ page }) => {
    await page.goto(INLINE_FORM);
    const valid = await page
      .locator("#how-many-devices-field input[type=radio]")
      .first()
      .evaluate((el: HTMLInputElement) => el.checkValidity());
    expect(valid).toBe(false);
  });

  test("native validation blocks a required textarea and select", async ({
    page,
  }) => {
    await page.goto(INLINE_FORM);
    for (const id of [
      "#required-details-summary",
      "#required-details-team-size",
      "#required-details-project-name",
    ]) {
      const valid = await page
        .locator(id)
        .evaluate((el: HTMLInputElement) => el.checkValidity());
      expect(valid, `${id} should be invalid while empty`).toBe(false);
    }
  });

  test("KNOWN GAP: required checkbox groups are NOT blocked with JS off", async ({
    page,
  }) => {
    // Not a bug in this feature — HTML cannot express "at least one of this
    // group", so a required checkbox group has no native floor and none is
    // faked. Documented in spec §4. The real fix is server-side validation,
    // tracked as the marketo-forms-no-js-data-loss effort.
    //
    // This test asserts the gap so it shows up in test output rather than
    // living only in prose. If it ever fails, someone added a floor and this
    // test plus spec §4 should be updated together.
    await page.goto(INLINE_FORM);
    const boxes = page.locator("#kind-of-device-field input[type=checkbox]");
    const count = await boxes.count();
    expect(count).toBeGreaterThan(0);
    for (let i = 0; i < count; i++) {
      await expect(boxes.nth(i)).not.toHaveAttribute("required", /.*/);
    }
  });
});

test.describe("Button scoping", () => {
  test("each form's gating drives only its own button", async ({ page }) => {
    // TWO_FORM renders two independent generated forms in one document: an
    // inline form (#mktoForm_9998) and a modal form (#mktoForm_9999, inside
    // #contact-modal). Both render the hardcoded about-you fields under the
    // SAME ids (firstName, email, company, title — _form-fields.html), so
    // every field locator below is scoped to one form's element, never a
    // bare id selector.
    //
    // Before this work, both entry points resolved the submit button with
    // document.querySelector(".js-submit-button") — first match in document
    // order, i.e. always the inline form's button. Filling in the MODAL
    // form's required fields would therefore have incorrectly un-gated the
    // untouched INLINE form's button, while the modal's own button was never
    // correctly wired at all. This test fills the modal and asserts the
    // opposite: the modal's own button un-gates, and the inline form's
    // button — never touched — stays gated throughout.
    await page.context().addCookies([
      {
        name: "_cookies_accepted",
        value: "all",
        domain: "0.0.0.0",
        path: "/",
      },
    ]);
    await page.goto(TWO_FORM);

    const inlineForm = page.locator("#mktoForm_9998");
    const inlineButton = inlineForm.locator("button[type=submit]");
    await expect(inlineButton).toHaveAttribute("aria-disabled", "true");

    await page.locator(".js-invoke-modal").first().click();
    const modalForm = page.locator("#contact-modal form");
    await expect(modalForm).toBeVisible();
    const modalButton = modalForm.locator("button[type=submit]");
    await expect(modalButton).toHaveAttribute("aria-disabled", "true");

    // Fully answer the MODAL form's required questions only.
    await modalForm.locator("#firstName").fill("Benjamin");
    await modalForm.locator("#lastName").fill("Oni");
    await modalForm.locator("#email").fill("benjo@canonical.com");
    await modalForm.locator("#company").fill("Canonical");
    await modalForm.locator("#title").fill("Engineer");
    // Explicit, not relying on prepare-form-inputs.js's geoip pre-fill: that
    // module resolves its target with document.querySelector("select#country")
    // (the same first-match-in-document class of bug this test is about, just
    // in an unrelated module) so on a two-country-select page it only ever
    // reaches the inline form's #country, leaving the modal's unfilled. Out
    // of scope for the required-field-gate feature this task audits — select
    // it directly here, exactly as a real visitor on this page would have to.
    await modalForm.locator("#country").selectOption("US");
    await modalForm.locator("#required-details-project-name").fill("Gating");
    await modalForm.locator("#required-details-team-size").selectOption("1-10");
    await modalForm
      .locator("#required-details-summary")
      .fill("Testing the gate.");
    // force: true — custom-styled checkbox/radio, same precedent as the
    // rest of this suite.
    await modalForm
      .locator("#kind-of-device-field input[type=checkbox]")
      .first()
      .check({ force: true });
    await modalForm
      .locator("#how-many-devices-field input[type=radio]")
      .first()
      .check({ force: true });

    // The modal's own button un-gates...
    await expect(modalButton).not.toHaveAttribute("aria-disabled", "true");
    await expect(modalButton).not.toHaveClass(/is-disabled/);

    // ...while the untouched inline form's button, on the same page, stays
    // gated. Under the old document-order bug this would have flipped too.
    await expect(inlineButton).toHaveAttribute("aria-disabled", "true");
    await expect(inlineButton).toHaveClass(/is-disabled/);
  });
});
