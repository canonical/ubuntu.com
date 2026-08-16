/**
 * Required-field submit gating for generated Marketo forms.
 *
 * The button is gated with aria-disabled, never the disabled attribute, so it
 * stays focusable, stays in the tab order, and can explain what is missing
 * when pressed. See .scratch/form-required-field-gating/spec.md.
 */

const QUESTION_SELECTOR = "fieldset[data-required-question]";

/**
 * The visible question text for a required fieldset.
 * _form-fields.html renders a screen-reader-only legend first and the visible
 * one second, so prefer the visible one by class and fall back to any legend.
 */
function questionLabel(fieldset) {
  const legend =
    fieldset.querySelector("legend.js-formfield-title") ||
    fieldset.querySelector("legend");
  return legend ? legend.textContent.trim().replace(/:$/, "") : "This question";
}

/**
 * The human-readable name of an individual control, taken from the label the
 * form already renders. Nothing here is authored per form.
 */
function controlLabel(control) {
  if (control.id) {
    const label = control
      .closest("form")
      ?.querySelector(`label[for="${CSS.escape(control.id)}"]`);
    if (label) return label.textContent.trim().replace(/:$/, "");
  }
  const wrapping = control.closest("label");
  if (wrapping) return wrapping.textContent.trim().replace(/:$/, "");
  return control.getAttribute("aria-label") || control.name || "This field";
}

function isEligible(control) {
  return !control.disabled && control.type !== "hidden";
}

/**
 * Whether a single control's own answer satisfies constraint validation.
 * Controls that never validate (e.g. checkboxes, which have no per-box
 * `required`) are vacuously valid here — checkbox groups are judged as a
 * group by isQuestionAnswered instead.
 */
function isValid(control) {
  return !control.willValidate || control.checkValidity();
}

/**
 * A required question is answered when every part of it is answered:
 * at least one enabled checkbox is ticked (HTML cannot express "at least
 * one of this group", which is why this clause exists at all —
 * form.checkValidity() is blind to it) AND every other eligible control in
 * the fieldset (radio group, textarea, select — anything that carries
 * native `required`) passes constraint validation. A fieldset with no
 * checkboxes is judged purely on the latter; a fieldset with no other
 * controls is judged purely on the former — the `every`/vacuous-true clause
 * keeps both cases correct without a branch.
 */
function isQuestionAnswered(fieldset) {
  const checkboxes = fieldset.querySelectorAll('input[type="checkbox"]');
  const checkboxAnswered =
    !checkboxes.length ||
    Array.from(checkboxes).some((box) => box.checked && !box.disabled);

  const othersAnswered = Array.from(
    fieldset.querySelectorAll("input, select, textarea"),
  )
    .filter((control) => control.type !== "checkbox")
    .filter(isEligible)
    .every(isValid);

  return checkboxAnswered && othersAnswered;
}

/**
 * Every unanswered required question and unsatisfied required control.
 * Questions come first, then individual controls, each in document order.
 */
export function findUnanswered(form) {
  const missing = [];

  form.querySelectorAll(QUESTION_SELECTOR).forEach((fieldset) => {
    if (!isQuestionAnswered(fieldset)) {
      missing.push({ target: fieldset, label: questionLabel(fieldset) });
    }
  });

  form.querySelectorAll("input, select, textarea").forEach((control) => {
    if (!isEligible(control)) return;
    if (isValid(control)) return;
    // Controls inside a required question are reported as that question.
    if (control.closest(QUESTION_SELECTOR)) return;
    missing.push({ target: control, label: controlLabel(control) });
  });

  return missing;
}

export function isComplete(form) {
  return findUnanswered(form).length === 0;
}

const GATE_KEY = "__requiredFieldGate";
const GATED_CLASS = "is-disabled";
const SUMMARY_CLASS = "p-notification--caution";

function clearSummary(summary) {
  summary.textContent = "";
  summary.classList.remove(SUMMARY_CLASS);
}

/** Focus the control a summary entry points at, or a question's first box. */
function focusTarget(target) {
  const control =
    target.tagName === "FIELDSET"
      ? target.querySelector("input:not(:disabled), select, textarea")
      : target;
  if (!control) return;
  control.focus();
  control.scrollIntoView({ block: "center" });
}

function renderSummary(summary, missing) {
  clearSummary(summary);
  summary.classList.add(SUMMARY_CLASS);

  // h2, not h3: axe's heading-order rule caught this summary being the
  // first heading-level element after the page's own h1 (fieldset legends
  // and .js-formfield-title labels are not headings), which skipped a
  // level. h2 keeps the hierarchy valid without a visual change — the
  // class, not the tag, carries the size.
  const heading = document.createElement("h2");
  heading.className = "p-heading--5";
  heading.setAttribute("tabindex", "-1");
  heading.textContent = `${missing.length} answer${
    missing.length === 1 ? "" : "s"
  } still needed`;

  const list = document.createElement("ul");
  list.className = "p-list";
  missing.forEach(({ target, label }) => {
    const item = document.createElement("li");
    item.className = "p-list__item";
    const link = document.createElement("a");
    link.href = "#";
    link.textContent = label;
    link.addEventListener("click", (event) => {
      event.preventDefault();
      focusTarget(target);
    });
    item.appendChild(link);
    list.appendChild(item);
  });

  summary.appendChild(heading);
  summary.appendChild(list);
  return heading;
}

/**
 * Gate a form's submit button until every required question has an answer.
 * Idempotent — re-initialising tears down the previous handle first, which the
 * modal path needs because initialiseForm() runs on every open.
 */
export function initRequiredFieldGate(form) {
  destroyRequiredFieldGate(form);

  const button = form.querySelector('button[type="submit"]');
  const summary = form.querySelector("[data-required-summary]");
  if (!button || !summary) return null;

  // Applied here, never in the template: with JS off the visitor keeps a
  // normal button and full native validation.
  form.setAttribute("novalidate", "");
  if (summary.id) button.setAttribute("aria-describedby", summary.id);

  const refresh = () => {
    const missing = findUnanswered(form);
    if (missing.length) {
      button.setAttribute("aria-disabled", "true");
      button.classList.add(GATED_CLASS);
    } else {
      button.removeAttribute("aria-disabled");
      button.classList.remove(GATED_CLASS);
      clearSummary(summary);
    }
    return missing;
  };

  const onSubmit = (event) => {
    const missing = refresh();
    if (!missing.length) return;
    event.preventDefault();
    // Without this the spinner and consent listeners fire on a submission
    // that never happens, and the button sticks on a spinner forever.
    event.stopImmediatePropagation();
    renderSummary(summary, missing).focus();
  };

  const onInteraction = () => refresh();

  form.addEventListener("submit", onSubmit);
  form.addEventListener("input", onInteraction);
  form.addEventListener("change", onInteraction);
  window.addEventListener("pageshow", onInteraction);

  refresh();

  const handle = {
    refresh,
    destroy() {
      form.removeEventListener("submit", onSubmit);
      form.removeEventListener("input", onInteraction);
      form.removeEventListener("change", onInteraction);
      window.removeEventListener("pageshow", onInteraction);
      form.removeAttribute("novalidate");
      button.removeAttribute("aria-disabled");
      button.removeAttribute("aria-describedby");
      button.classList.remove(GATED_CLASS);
      clearSummary(summary);
      delete form[GATE_KEY];
    },
  };

  form[GATE_KEY] = handle;
  return handle;
}

export function destroyRequiredFieldGate(form) {
  if (form && form[GATE_KEY]) form[GATE_KEY].destroy();
}
