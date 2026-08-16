import { findUnanswered, isComplete } from "./required-field-gate.js";

function buildForm(innerHTML) {
  document.body.innerHTML = `<form data-required-gate>${innerHTML}
    <div id="required-field-summary-1" data-required-summary role="alert"></div>
    <button type="submit" class="js-submit-button">Submit</button>
  </form>`;
  return document.querySelector("form");
}

const REQUIRED_TEXT = `
  <label class="is-required" for="company">Company:</label>
  <input required id="company" name="company" type="text" />`;

const REQUIRED_EMAIL = `
  <label class="is-required" for="email">Email:</label>
  <input required id="email" name="email" type="email"
         pattern="^[^ ]+@[^ ]+\\.[a-z]{2,26}$" />`;

const CHECKBOX_QUESTION = `
  <fieldset data-required-question id="kind-of-device-field">
    <legend class="p-heading--4 js-formfield-title is-required">What kind of device are you using?</legend>
    <label class="p-checkbox"><input class="p-checkbox__input" type="checkbox" id="desktop" value="Desktop" /><span>Desktop</span></label>
    <label class="p-checkbox"><input class="p-checkbox__input" type="checkbox" id="server" value="Server" /><span>Server</span></label>
  </fieldset>`;

const RADIO_QUESTION = `
  <fieldset data-required-question id="how-many-devices-field">
    <legend class="p-heading--4 js-formfield-title is-required">How many devices?</legend>
    <label class="p-radio"><input required class="p-radio__input" type="radio" id="few" name="_radio_how-many-devices" value="1-10" /><span>1-10</span></label>
    <label class="p-radio"><input required class="p-radio__input" type="radio" id="many" name="_radio_how-many-devices" value="11+" /><span>11+</span></label>
  </fieldset>`;

describe("findUnanswered", () => {
  it("reports an empty required text field by its label", () => {
    const form = buildForm(REQUIRED_TEXT);
    const missing = findUnanswered(form);
    expect(missing).toHaveLength(1);
    expect(missing[0].label).toBe("Company");
    expect(missing[0].target.id).toBe("company");
  });

  it("stops reporting a required text field once it has a value", () => {
    const form = buildForm(REQUIRED_TEXT);
    form.querySelector("#company").value = "Canonical";
    expect(findUnanswered(form)).toHaveLength(0);
    expect(isComplete(form)).toBe(true);
  });

  it("treats a filled-but-malformed email as unanswered", () => {
    const form = buildForm(REQUIRED_EMAIL);
    form.querySelector("#email").value = "benjo@";
    // The spec chose full validity over emptiness: a typo keeps the gate shut.
    expect(findUnanswered(form)).toHaveLength(1);
    expect(findUnanswered(form)[0].label).toBe("Email");
  });

  it("accepts a well-formed email", () => {
    const form = buildForm(REQUIRED_EMAIL);
    form.querySelector("#email").value = "benjo@canonical.com";
    expect(findUnanswered(form)).toHaveLength(0);
  });

  it("reports an unanswered checkbox question once, by its legend", () => {
    const form = buildForm(CHECKBOX_QUESTION);
    const missing = findUnanswered(form);
    expect(missing).toHaveLength(1);
    expect(missing[0].label).toBe("What kind of device are you using?");
    expect(missing[0].target.id).toBe("kind-of-device-field");
  });

  it("accepts a checkbox question with any one box ticked", () => {
    const form = buildForm(CHECKBOX_QUESTION);
    form.querySelector("#server").checked = true;
    expect(findUnanswered(form)).toHaveLength(0);
  });

  it("ignores checked boxes that have been disabled", () => {
    // toggleCheckboxVisibility disables boxes in response to other boxes, and
    // disabled controls are exempt from constraint validation.
    const form = buildForm(CHECKBOX_QUESTION);
    const server = form.querySelector("#server");
    server.checked = true;
    server.disabled = true;
    expect(findUnanswered(form)).toHaveLength(1);
  });

  it("reports a radio group once, by its legend, not once per radio", () => {
    const form = buildForm(RADIO_QUESTION);
    const missing = findUnanswered(form);
    expect(missing).toHaveLength(1);
    expect(missing[0].label).toBe("How many devices?");
  });

  it("accepts a radio group with a selection", () => {
    const form = buildForm(RADIO_QUESTION);
    form.querySelector("#many").checked = true;
    expect(findUnanswered(form)).toHaveLength(0);
  });

  it("lists every miss across a mixed form", () => {
    const form = buildForm(REQUIRED_TEXT + CHECKBOX_QUESTION + RADIO_QUESTION);
    expect(findUnanswered(form).map((m) => m.label)).toEqual([
      "What kind of device are you using?",
      "How many devices?",
      "Company",
    ]);
  });

  it("ignores hidden and disabled controls", () => {
    const form = buildForm(`
      <input type="hidden" name="formid" value="9998" required />
      <input type="text" id="off" name="off" required disabled />`);
    expect(findUnanswered(form)).toHaveLength(0);
  });
});
