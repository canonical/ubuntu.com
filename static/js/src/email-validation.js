export const INVALID_EMAIL_MESSAGE =
  "Invalid email address. Please use the suggested format name@example.com";

const EMAIL_INPUT_SELECTOR = 'input[type="email"]';
const MESSAGE_CLASS = "p-form-validation__message";

let messageCount = 0;

/**
 * Builds an id unique to this input, so pages with several email fields do not
 * end up with every field described by the same message.
 *
 * @param {HTMLInputElement} emailInput - The email input element.
 * @returns {string} - The id for this input's error message.
 */
function errorMessageId(emailInput) {
  const identifier = emailInput.id || emailInput.name || ++messageCount;
  return `${identifier}-invalid-email-message`;
}

/**
 * Reports whether an input holds an email address the browser rejects.
 *
 * An empty field is not treated as invalid here: emptiness is the `required`
 * attribute's business, and the browser's own "please fill out this field"
 * message covers it. Reads `validity` rather than calling `checkValidity()`,
 * which would fire another `invalid` event and re-enter these handlers.
 *
 * @param {HTMLInputElement} emailInput - The email input element.
 * @returns {boolean} - True when the value is present but malformed.
 */
function isInvalidEmail(emailInput) {
  if (!emailInput.value.trim()) return false;
  return (
    emailInput.validity.typeMismatch || emailInput.validity.patternMismatch
  );
}

/**
 * Puts our wording on the native validation bubble, replacing the browser's
 * default, which differs between browsers and locales.
 *
 * @param {HTMLInputElement} emailInput - The email input element.
 */
function refreshCustomValidity(emailInput) {
  // Cleared first so the field does not stay permanently invalid, and so the
  // validity flags below reflect the value rather than our own custom error.
  emailInput.setCustomValidity("");
  if (isInvalidEmail(emailInput)) {
    emailInput.setCustomValidity(INVALID_EMAIL_MESSAGE);
  }
}

/**
 * Removes any error message currently shown for an email input.
 *
 * @param {HTMLInputElement} emailInput - The email input element.
 */
function resetErrorState(emailInput) {
  emailInput.parentElement?.classList.remove("is-error");
  emailInput.removeAttribute("aria-describedby");

  const errorElement = emailInput.nextElementSibling;
  if (errorElement?.matches(`.${MESSAGE_CLASS}`)) {
    errorElement.remove();
  }
}

/**
 * Shows the standard error message beneath an email input.
 *
 * @param {HTMLInputElement} emailInput - The email input element.
 */
function showError(emailInput) {
  const errorElement = document.createElement("div");
  errorElement.id = errorMessageId(emailInput);
  errorElement.className = MESSAGE_CLASS;
  errorElement.setAttribute("role", "alert");
  errorElement.textContent = INVALID_EMAIL_MESSAGE;

  emailInput.setAttribute("aria-describedby", errorElement.id);
  emailInput.classList.add("p-form-validation__input");
  emailInput.parentElement?.classList.add("p-form-validation", "is-error");
  emailInput.after(errorElement);
}

/**
 * Validates an email input, showing the error message when it is invalid.
 *
 * @param {HTMLInputElement} emailInput - The email input element.
 */
function validateInput(emailInput) {
  resetErrorState(emailInput);
  refreshCustomValidity(emailInput);
  if (isInvalidEmail(emailInput)) {
    showError(emailInput);
  }
}

/**
 * Returns the email input an event was raised on, or null for other elements.
 *
 * @param {Event} event - A delegated DOM event.
 * @returns {HTMLInputElement|null} - The email input, or null.
 */
function getEmailInput(event) {
  const target = event.target;
  return target?.matches?.(EMAIL_INPUT_SELECTOR) ? target : null;
}

// Listeners are delegated from `document` rather than bound to each input so
// that email fields added after page load — the modal and generated forms built
// by dynamic-forms.js — are covered without needing to call back in here.
// `blur` and `invalid` do not bubble, hence the capture phase.
document.addEventListener(
  "blur",
  (event) => {
    const emailInput = getEmailInput(event);
    if (emailInput) validateInput(emailInput);
  },
  true,
);

document.addEventListener(
  "invalid",
  (event) => {
    const emailInput = getEmailInput(event);
    if (emailInput) validateInput(emailInput);
  },
  true,
);

document.addEventListener("input", (event) => {
  const emailInput = getEmailInput(event);
  if (!emailInput) return;
  resetErrorState(emailInput);
  refreshCustomValidity(emailInput);
});

export default { INVALID_EMAIL_MESSAGE };
