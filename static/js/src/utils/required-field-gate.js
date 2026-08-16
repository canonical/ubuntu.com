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
