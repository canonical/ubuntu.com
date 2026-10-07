import { test, expect, Locator, Page } from "@playwright/test";
import { acceptCookiePolicy } from "../../helpers/commands";
import {
  CANARY_COUNTRY,
  CANARY_OTHER_TEXT,
  CANARY_PHONE,
  CanaryForm,
  canaryForms,
} from "../../helpers/canary-fields";

// Hourly prod canary, see .github/workflows/marketo-canary.yaml

// Submissions taking longer than the soft threshold are flagged but not failed
const SLOW_SUBMIT_WARN_MS = 15000;

// Submissions taking longer than max threshold are considered failures
const MAX_SUBMIT_MS = 30000;

// intl-tel-input picks its country from the timezone
test.use({ timezoneId: "Europe/London" });

const selectChoice = async (form: Locator, field: string) => {
  const input = form.locator(field);
  await expect(input, `Field missing: ${field}`).toHaveCount(1);
  // Inputs are visually hidden
  await input.locator("xpath=ancestor::label[1]").click();
  await expect(input, `Could not select ${field}`).toBeChecked();
};

// Fails if a field is missing, i.e. the live form changed
const fillCanaryForm = async (form: Locator, config: CanaryForm) => {
  for (const { field, value } of config.textFields) {
    await expect(form.locator(field), `Field missing: ${field}`).toHaveCount(1);
    await form.locator(field).fill(value);
  }
  for (const field of config.choiceFields) {
    await selectChoice(form, field);
  }
  if (config.otherField) {
    const { field, textarea } = config.otherField;
    await selectChoice(form, field);
    await expect(
      form.locator(textarea),
      `"Other" textarea did not appear for ${field}`,
    ).toBeVisible();
    await form.locator(textarea).fill(CANARY_OTHER_TEXT);
  }
  await form.locator('select[name="country"]').selectOption(CANARY_COUNTRY);

  await expect(
    form.locator(".iti input#phone"),
    "intl-tel-input did not initialise on the phone field",
  ).toHaveCount(1);
  await form.locator("input#phone").fill(CANARY_PHONE);
  await form.locator("input#phone").blur();
};

const submitAndVerify = async (
  page: Page,
  form: Locator,
  config: CanaryForm,
) => {
  const returnURL = await form.locator('input[name="returnURL"]').inputValue();

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
    { timeout: MAX_SUBMIT_MS },
  );

  const start = Date.now();
  await submitButton.click();

  // What the page JS prepared
  const posted = new URLSearchParams((await requestPromise).postData() || "");
  expect(posted.get("formid"), "JS field prep: wrong formid").toBe(
    config.formId,
  );
  expect(
    posted.get("Comments_from_lead__c"),
    "JS field prep: Comments_from_lead__c was not built",
  ).toBeTruthy();
  if (config.otherField) {
    expect(
      posted.get("Comments_from_lead__c"),
      'JS field prep: "Other" text missing from Comments_from_lead__c',
    ).toContain(CANARY_OTHER_TEXT);
  }
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
  if (elapsed > SLOW_SUBMIT_WARN_MS) {
    // Flag slow submissions
    test.info().annotations.push({
      type: "slow-submit-warning",
      description: `Submission took ${elapsed}ms (soft threshold ${SLOW_SUBMIT_WARN_MS}ms)`,
    });
  }

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
  expect(location, "Unexpected redirect after submission").toContain(returnURL);
};

test.describe("Marketo canary", () => {
  for (const config of canaryForms) {
    test(`form ${config.formId} on ${config.path} submits to Marketo`, async ({
      page,
    }) => {
      test.setTimeout(MAX_SUBMIT_MS + 30000);

      // intl-tel-input only loads its utils after "load"; without them the
      // phone is posted empty
      const phoneUtilsLoaded = page.waitForEvent("requestfinished", {
        predicate: (req) =>
          new URL(req.url()).pathname === "/static/js/dist/utils.js",
        timeout: 30000,
      });

      // Third-party scripts can stall "load", the form checks wait for us
      await page.goto(
        config.modalId ? `${config.path}#get-in-touch` : config.path,
        { waitUntil: "domcontentloaded" },
      );
      await acceptCookiePolicy(page);

      if (config.modalId) {
        await expect(
          page.locator(`#${config.modalId}`),
          "Contact modal did not open",
        ).toBeVisible();
      }

      const form = page.locator(`form#mktoForm_${config.formId}`);
      await expect(form, "Contact form not found").toBeVisible();
      await phoneUtilsLoaded.catch(() => {
        throw new Error(
          "Phone formatter never loaded (page load event stalled)",
        );
      });
      await fillCanaryForm(form, config);
      await submitAndVerify(page, form, config);
    });
  }
});
