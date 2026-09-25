import { test, expect, Locator, Page } from "@playwright/test";
import { acceptCookiePolicy } from "../../helpers/commands";
import {
  CANARY_COUNTRY,
  CANARY_PHONE,
  canaryCheckboxFields,
  canaryRadioFields,
  canaryTextFields,
} from "../../helpers/canary-fields";

// Hourly prod canary, see .github/workflows/marketo-canary.yaml

const MAX_SUBMIT_MS = 15000;

// intl-tel-input picks its country from the timezone
test.use({ timezoneId: "Europe/London" });

// Fails if a field is missing, i.e. the live form changed
const fillCanaryForm = async (form: Locator) => {
  for (const { field, value } of canaryTextFields) {
    await expect(form.locator(field), `Field missing: ${field}`).toHaveCount(1);
    await form.locator(field).fill(value);
  }
  for (const { field } of [...canaryCheckboxFields, ...canaryRadioFields]) {
    const input = form.locator(field);
    await expect(input, `Field missing: ${field}`).toHaveCount(1);
    // Inputs are visually hidden
    await input.locator("xpath=ancestor::label[1]").click();
    await expect(input, `Could not select ${field}`).toBeChecked();
  }
  await form.locator('select[name="country"]').selectOption(CANARY_COUNTRY);

  await expect(
    form.locator(".iti input#phone"),
    "intl-tel-input did not initialise on the phone field",
  ).toHaveCount(1);
  await form.locator("input#phone").fill(CANARY_PHONE);
  await form.locator("input#phone").blur();
};

const submitAndVerify = async (page: Page, form: Locator, formId: string) => {
  const returnURL = await form
    .locator('input[name="returnURL"]')
    .inputValue();

  const submitButton = form.getByRole("button", { name: /Submit/ });
  await expect(submitButton, "Submit button is disabled").toBeEnabled();

  // Prod may append ?mkt=... to the action
  const isSubmit = (url: string, method: string) =>
    new URL(url).pathname === "/marketo/submit" && method === "POST";
  const requestPromise = page.waitForRequest((req) =>
    isSubmit(req.url(), req.method()),
  );
  const responsePromise = page.waitForResponse(
    (res) => isSubmit(res.url(), res.request().method()),
    { timeout: MAX_SUBMIT_MS * 2 },
  );

  const start = Date.now();
  await submitButton.click();

  // What the page JS prepared
  const posted = new URLSearchParams((await requestPromise).postData() || "");
  expect(posted.get("formid"), "JS field prep: wrong formid").toBe(formId);
  expect(
    posted.get("Comments_from_lead__c"),
    "JS field prep: Comments_from_lead__c was not built",
  ).toBeTruthy();
  expect(
    [...posted.keys()].filter((key) => key.startsWith("_radio_")),
    "JS field prep: _radio_ fields were not stripped",
  ).toEqual([]);
  expect(
    posted.get("phone"),
    "JS field prep: phone not in international format",
  ).toMatch(/^\+44/);

  // How /marketo/submit and Marketo responded
  const response = await responsePromise;
  const elapsed = Date.now() - start;
  test.info().annotations.push({
    type: "submit-duration-ms",
    description: String(elapsed),
  });

  const location = response.headers()["location"] || "";
  expect(
    response.status(),
    `/marketo/submit returned ${response.status()}: ` +
      `${response.status() === 302 ? location : await response.text()}`,
  ).toBe(302);
  expect(
    location,
    "Marketo rejected the submission (redirected to contact-form-fail)",
  ).not.toContain("contact-form-fail");
  expect(location, "Unexpected redirect after submission").toContain(
    returnURL,
  );
  expect(
    elapsed,
    `/marketo/submit took ${elapsed}ms (limit ${MAX_SUBMIT_MS}ms)`,
  ).toBeLessThan(MAX_SUBMIT_MS);
};

test.describe("Marketo canary", () => {
  test("form generator modal on /pricing/pro submits to Marketo", async ({
    page,
  }) => {
    await page.goto("/pricing/pro");
    await acceptCookiePolicy(page);

    await page
      .locator('a.js-invoke-modal[aria-controls="pricing-contact-modal"]')
      .first()
      .click();
    const modal = page.locator("#pricing-contact-modal");
    await expect(modal, "Contact modal did not open").toBeVisible();

    const form = modal.locator("form#mktoForm_1240");
    await fillCanaryForm(form);
    await submitAndVerify(page, form, "1240");
  });

  test("static form on /kubernetes/contact-us submits to Marketo", async ({
    page,
  }) => {
    await page.goto("/kubernetes/contact-us");
    await acceptCookiePolicy(page);

    const form = page.locator("form#mktoForm_3230");
    await expect(form, "Contact form not found").toBeVisible();
    await fillCanaryForm(form);
    await submitAndVerify(page, form, "3230");
  });
});
