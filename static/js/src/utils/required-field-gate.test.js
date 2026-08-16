import {
  findUnanswered,
  isComplete,
  initRequiredFieldGate,
  destroyRequiredFieldGate,
} from "./required-field-gate.js";

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

const MIXED_QUESTION = `
  <fieldset data-required-question id="mixed-field">
    <legend class="p-heading--4 js-formfield-title is-required">Tell us about your setup</legend>
    <label class="p-checkbox"><input class="p-checkbox__input" type="checkbox" id="mixed-desktop" value="Desktop" /><span>Desktop</span></label>
    <textarea required aria-label="Tell us about your setup" id="mixed-details" rows="5"></textarea>
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

  it("does not count a checkbox tick as answering a required textarea beside it", () => {
    const form = buildForm(MIXED_QUESTION);
    form.querySelector("#mixed-desktop").checked = true;
    expect(findUnanswered(form)).toHaveLength(1);
  });

  it("accepts a mixed question only when both parts are answered", () => {
    const form = buildForm(MIXED_QUESTION);
    form.querySelector("#mixed-desktop").checked = true;
    form.querySelector("#mixed-details").value = "Two laptops and a server.";
    expect(findUnanswered(form)).toHaveLength(0);
  });
});

function submit(form) {
  return form.dispatchEvent(
    new Event("submit", { bubbles: true, cancelable: true }),
  );
}

describe("initRequiredFieldGate", () => {
  afterEach(() => {
    document.body.innerHTML = "";
  });

  it("gates an untouched form on initialisation", () => {
    const form = buildForm(REQUIRED_TEXT);
    initRequiredFieldGate(form);
    const button = form.querySelector("button[type=submit]");
    expect(button.getAttribute("aria-disabled")).toBe("true");
    expect(button.classList.contains("is-disabled")).toBe(true);
    // Never the disabled attribute — the button must stay focusable.
    expect(button.disabled).toBe(false);
  });

  it("applies novalidate so the gate owns all validation feedback", () => {
    const form = buildForm(REQUIRED_TEXT);
    initRequiredFieldGate(form);
    expect(form.hasAttribute("novalidate")).toBe(true);
  });

  it("points the button at the summary with aria-describedby", () => {
    const form = buildForm(REQUIRED_TEXT);
    initRequiredFieldGate(form);
    expect(
      form
        .querySelector("button[type=submit]")
        .getAttribute("aria-describedby"),
    ).toBe("required-field-summary-1");
  });

  it("un-gates when the last required answer arrives", () => {
    const form = buildForm(REQUIRED_TEXT);
    initRequiredFieldGate(form);
    const input = form.querySelector("#company");
    input.value = "Canonical";
    input.dispatchEvent(new Event("input", { bubbles: true }));

    const button = form.querySelector("button[type=submit]");
    expect(button.hasAttribute("aria-disabled")).toBe(false);
    expect(button.classList.contains("is-disabled")).toBe(false);
  });

  it("re-gates when a required answer is cleared", () => {
    const form = buildForm(REQUIRED_TEXT);
    initRequiredFieldGate(form);
    const input = form.querySelector("#company");
    input.value = "Canonical";
    input.dispatchEvent(new Event("input", { bubbles: true }));
    input.value = "";
    input.dispatchEvent(new Event("input", { bubbles: true }));

    expect(
      form.querySelector("button[type=submit]").getAttribute("aria-disabled"),
    ).toBe("true");
  });

  it("un-gates on a checkbox question via the change event", () => {
    const form = buildForm(CHECKBOX_QUESTION);
    initRequiredFieldGate(form);
    const box = form.querySelector("#server");
    box.checked = true;
    box.dispatchEvent(new Event("change", { bubbles: true }));
    expect(
      form.querySelector("button[type=submit]").hasAttribute("aria-disabled"),
    ).toBe(false);
  });

  it("blocks a gated submit and renders the summary", () => {
    const form = buildForm(REQUIRED_TEXT + CHECKBOX_QUESTION);
    initRequiredFieldGate(form);

    const notCancelled = submit(form);
    expect(notCancelled).toBe(false);

    const summary = form.querySelector("[data-required-summary]");
    expect(summary.textContent).toContain("2 answers still needed");
    expect(summary.textContent).toContain("What kind of device are you using?");
    expect(summary.textContent).toContain("Company");
    expect(summary.classList.contains("p-notification--caution")).toBe(true);
  });

  it("singularises the summary heading for a single miss", () => {
    const form = buildForm(REQUIRED_TEXT);
    initRequiredFieldGate(form);
    submit(form);
    expect(form.querySelector("[data-required-summary]").textContent).toContain(
      "1 answer still needed",
    );
  });

  it("moves focus to the summary heading on a blocked submit", () => {
    const form = buildForm(REQUIRED_TEXT);
    initRequiredFieldGate(form);
    submit(form);
    const heading = form.querySelector("[data-required-summary] h3");
    expect(heading.getAttribute("tabindex")).toBe("-1");
    expect(document.activeElement).toBe(heading);
  });

  it("stops other submit listeners from running on a blocked submit", () => {
    // Without stopImmediatePropagation the spinner listener fires and the
    // button sticks showing a spinner for a submission that never happened.
    const form = buildForm(REQUIRED_TEXT);
    const spinner = jest.fn();
    initRequiredFieldGate(form);
    form.addEventListener("submit", spinner);
    submit(form);
    expect(spinner).not.toHaveBeenCalled();
  });

  it("lets a complete form submit and clears the summary", () => {
    const form = buildForm(REQUIRED_TEXT);
    initRequiredFieldGate(form);
    submit(form); // populate the summary first
    expect(
      form.querySelector("[data-required-summary]"),
    ).not.toBeEmptyDOMElement();

    const input = form.querySelector("#company");
    input.value = "Canonical";
    input.dispatchEvent(new Event("input", { bubbles: true }));

    expect(form.querySelector("[data-required-summary]")).toBeEmptyDOMElement();
    expect(submit(form)).toBe(true);
  });

  it("is idempotent — re-initialising does not double-bind", () => {
    const form = buildForm(REQUIRED_TEXT);
    initRequiredFieldGate(form);
    initRequiredFieldGate(form);
    const spinner = jest.fn();
    form.addEventListener("submit", spinner);
    submit(form);
    expect(spinner).not.toHaveBeenCalled();
    // One summary, not two.
    expect(form.querySelectorAll("[data-required-summary] h3")).toHaveLength(1);
  });

  it("destroy removes every trace of the gate", () => {
    const form = buildForm(REQUIRED_TEXT);
    const gate = initRequiredFieldGate(form);
    gate.destroy();

    const button = form.querySelector("button[type=submit]");
    expect(button.hasAttribute("aria-disabled")).toBe(false);
    expect(button.classList.contains("is-disabled")).toBe(false);
    expect(form.hasAttribute("novalidate")).toBe(false);
    expect(form.querySelector("[data-required-summary]")).toBeEmptyDOMElement();
    // And the submit listener is gone.
    expect(submit(form)).toBe(true);
  });

  it("recomputes on pageshow so bfcache restores land gated correctly", () => {
    // static-forms.js resets the spinner on a persisted pageshow; the gate
    // recomputes independently rather than trusting a captured button state.
    const form = buildForm(REQUIRED_TEXT);
    initRequiredFieldGate(form);
    const button = form.querySelector("button[type=submit]");

    form.querySelector("#company").value = "Canonical";
    window.dispatchEvent(new Event("pageshow"));
    expect(button.hasAttribute("aria-disabled")).toBe(false);

    form.querySelector("#company").value = "";
    window.dispatchEvent(new Event("pageshow"));
    expect(button.getAttribute("aria-disabled")).toBe("true");
  });

  it("destroyRequiredFieldGate is safe on an ungated form", () => {
    const form = buildForm(REQUIRED_TEXT);
    expect(() => destroyRequiredFieldGate(form)).not.toThrow();
  });

  it("returns null when the form has no summary container", () => {
    document.body.innerHTML = `<form data-required-gate>${REQUIRED_TEXT}
      <button type="submit">Submit</button></form>`;
    expect(initRequiredFieldGate(document.querySelector("form"))).toBeNull();
  });
});
