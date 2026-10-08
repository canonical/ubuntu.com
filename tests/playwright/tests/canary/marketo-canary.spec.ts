import { test, expect, Locator, Page, Request, Response } from "@playwright/test";
import { acceptCookiePolicy } from "../../helpers/commands";
import {
  CANARY_COUNTRY,
  CANARY_OTHER_TEXT,
  CANARY_PHONE,
  CanaryForm,
  canaryForms,
} from "../../helpers/canary-fields";

// Hourly prod canary, see .github/workflows/marketo-canary.yaml

const MAX_SUBMIT_MS = 20000;
const TIMEOUT_MS = 5000;

test.use({ timezoneId: "Europe/London" });

// Helper functions

const selectChoice = async (form: Locator, field: string) => {
  const input = form.locator(field);
  await expect(input, `Field missing: ${field}`).toHaveCount(1);

  // Inputs are visually hidden
  await input.locator("xpath=ancestor::label[1]").click();
  await expect(input, `Could not select ${field}`).toBeChecked();
};

const selectChoices = async (form: Locator, config: CanaryForm) => {
  for (const field of config.choiceFields) {
    await selectChoice(form, field);
  }
};

const fillTextFields = async (form: Locator, config: CanaryForm) => {
  for (const { field, value } of config.textFields) {
    await expect(form.locator(field), `Field missing: ${field}`).toHaveCount(1);
    await form.locator(field).fill(value);
  }
};

const fillOtherField = async (form: Locator, config: CanaryForm) => {
  const { field, textarea } = config.otherField!;
  await selectChoice(form, field);
  await expect(
    form.locator(textarea),
    `"Other" textarea did not appear for ${field}`,
  ).toBeVisible();
  await form.locator(textarea).fill(CANARY_OTHER_TEXT);
};

const waitForPhoneInput = async (form: Locator) => {
  await expect(
    form.locator(".iti input#phone"),
    "intl-tel-input did not initialise on the phone field",
  ).toHaveCount(1);
};

const fillCountryAndPhone = async (form: Locator) => {
  await form.locator('select[name="country"]').selectOption(CANARY_COUNTRY);
  await expect(
    form.locator('select[name="country"]'),
    "Country selection was overwritten",
  ).toHaveValue(CANARY_COUNTRY);

  await form.locator("input#phone").fill(CANARY_PHONE);
  await form.locator("input#phone").blur();
};

const isSubmit = (url: string, method: string) =>
  new URL(url).pathname === "/marketo/submit" && method === "POST";

const submitForm = async (page: Page, form: Locator) => {
  const returnURL = await form.locator('input[name="returnURL"]').inputValue();

  const submitButton = form.getByRole("button", { name: /Submit/ });
  await expect(submitButton, "Submit button is disabled").toBeEnabled();

  const requestPromise = page.waitForRequest(
    (req) => isSubmit(req.url(), req.method()),
    { timeout: TIMEOUT_MS },
  );
  const responsePromise = page.waitForResponse(
    (res) => isSubmit(res.url(), res.request().method()),
    { timeout: MAX_SUBMIT_MS },
  );

  const start = Date.now();
  await submitButton.click();
  const request = await requestPromise;
  const response = await responsePromise;
  const elapsed = Date.now() - start;

  test.info().annotations.push({
    type: "submit-duration-ms",
    description: String(elapsed),
  });

  return { request, response, returnURL, elapsed };
};

// Verify that JS fields were processed as expected
const verifyPayload = (request: Request, config: CanaryForm) => {
  const posted = new URLSearchParams(request.postData() || "");
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
};

// Verify endpoint and Marketo response
const verifyResponse = async (
  response: Response,
  returnURL: string,
  elapsed: number,
) => {
  // Check submission duration
  expect(
    elapsed,
    `/marketo/submit took ${elapsed}ms (limit ${MAX_SUBMIT_MS}ms)`,
  ).toBeLessThan(MAX_SUBMIT_MS);

  // Check response status
  const location = response.headers()["location"] || "";
  expect(
    response.status(),
    `/marketo/submit returned ${response.status()}: ` +
      `${response.status() === 302 ? location : await response.text()}`,
  ).toBe(302);

  // Check redirect to failure page
  expect(
    location,
    "Marketo rejected the submission (redirected to contact-form-fail)",
  ).not.toContain("contact-form-fail");

  // Check redirect to the return URL
  expect(location, "Unexpected redirect after submission").toContain(returnURL);
};

// Marketo canary test suite
test.describe("Marketo canary", () => {
  for (const config of canaryForms) {

    const formId = config.formId;
    const modalId = config.modalId;

    test(`form ${formId} on ${config.path} submits to Marketo`, async ({
      page,
    }) => {
      let phoneUtilsStatus: number | undefined;
      page.on("response", (res) => {
        if (new URL(res.url()).pathname === "/static/js/dist/utils.js") {
          phoneUtilsStatus = res.status();
        }
      });

      const form = page.locator(`form#mktoForm_${formId}`);

      await test.step("Navigation: load page", async () => {
        await page.goto(
          modalId ? `${config.path}#get-in-touch` : config.path,
          { waitUntil: "domcontentloaded" },
        );
      });

      await test.step("Cookie banner: accept", () => acceptCookiePolicy(page));

      if (config.modalId) {
        await test.step("Modal: open", () =>
          expect(
            page.locator(`#${modalId}`),
            "Contact modal did not open",
          ).toBeVisible());
      }

      await test.step("Form: visible", () =>
        expect(form, "Contact form not found").toBeVisible());

      await test.step("Phone formatter: utils.js loaded", () =>
        expect
          .poll(() => phoneUtilsStatus, {
            message: "Phone formatter utils.js was not loaded",
            timeout: MAX_SUBMIT_MS,
          })
          .toBe(200));

      await test.step("Fields: fill text fields", () =>
        fillTextFields(form, config));

      await test.step("Fields: select choices", () =>
        selectChoices(form, config));

      if (config.otherField) {
        await test.step("Fields: fill the Other field", () =>
          fillOtherField(form, config));
      }

      await test.step("Phone input: intl-tel-input ready", () =>
        waitForPhoneInput(form));

      await test.step("Fields: set country and phone", () =>
        fillCountryAndPhone(form));

      const { request, response, returnURL, elapsed } = await test.step(
        "Submit: send to /marketo/submit",
        () => submitForm(page, form),
      );

      await test.step("Verify: JS-prepared payload", async () =>
        verifyPayload(request, config));

      await test.step("Verify: Marketo response", () =>
        verifyResponse(response, returnURL, elapsed));
    });
  }
});
