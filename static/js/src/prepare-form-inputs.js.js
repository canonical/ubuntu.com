import intlTelInput from "intl-tel-input";

/**
 * Initializes phone input field with intlTelInput and pre-fills the country input based on the user's timezone.
 *
 * @param {HTMLElement} phoneInput - The input element for the phone number.
 * @param {HTMLElement} countryInput - The select element for the country.
 */
async function prepareInputFields(phoneInput, countryInput) {
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const response = await fetch(`/user-country-tz.json?tz=${timezone}`);

  if (!response.ok) {
    throw new Error(`HTTP error with status: ${response.status}`);
  }

  const data = await response.json();
  const countryCode = data.country_code || "gb";

  if (phoneInput) {
    setupIntlTelInput(countryCode, phoneInput);
  }
  if (countryInput) {
    preFormatCountry(countryCode, countryInput);
  }
}

/**
 * Sets the value of the country input field.
 *
 * @param {string} countryCode - ISO country code to set as the value.
 * @param {HTMLElement} countryInput - The select element for the country.
 */
function preFormatCountry(countryCode, countryInput) {
  countryInput.value = countryCode;
}

/**
 * Configures intlTelInput.
 *
 * @param {string} countryCode - ISO country code for initializing the plugin.
 * @param {HTMLElement} phoneInput - The input element for the phone number.
 */
function setupIntlTelInput(countryCode, phoneInput) {
  phoneInput.removeAttribute("name"); // Ensure only the hidden input is submitted.

  intlTelInput(phoneInput, {
    utilsScript: "/static/js/dist/utils.js",
    separateDialCode: true,
    hiddenInput: phoneInput.name,
    initialCountry: countryCode,
  });

  addInputValidation(phoneInput);
}

/**
 * Adds validation logic and styling to the phone input field.
 *
 * @param {HTMLElement} phoneInput - The input element for the phone number.
 */
function addInputValidation(phoneInput) {
  const mobileInput = document.querySelector(".iti");
  mobileInput.parentNode.classList.add("p-form-validation");
  phoneInput.classList.add("p-form-validation__input");
  phoneInput.setAttribute("aria-describedby", "invalid-number-message");

  const errorElement = createErrorMessage();
  phoneInput.addEventListener("blur", () =>
    validateInput(phoneInput, errorElement)
  );
  phoneInput.addEventListener("change", () => resetErrorState(errorElement));
  phoneInput.addEventListener("keyup", () => resetErrorState(errorElement));
}

/**
 * Creates and returns an error message.
 *
 * @returns {HTMLElement} errorElement - The error message element.
 *
 */
function createErrorMessage() {
  const errorElement = document.createElement("div");
  errorElement.id = "invalid-number-message";
  errorElement.className = "p-form-validation__message";
  errorElement.style.marginTop = "1rem";
  errorElement.textContent = "Please enter a valid number.";
  errorElement.setAttribute("role", "alert");
  return errorElement;
}

/**
 * Validates the phone number and shows or hides the error message accordingly.
 *
 * @param {HTMLElement} errorElement - The error message element.
 */
function validateInput(phoneInput, errorElement) {
  resetErrorState(errorElement, phoneInput);
  const isValid = isValidNumber(phoneInput.value.trim());
  if (!isValid) {
    phoneInput.parentNode.parentNode.classList.add("is-error");
    phoneInput.parentNode.after(errorElement);
  }
}

/**
 * Checks the phone number is valid.
 *
 * @param {string} number - The phone number to validate.
 * @returns {boolean} - True if the number is valid, otherwise false.
 */
function isValidNumber(number) {
  const pattern = /^(?=[^a-zA-Z]*$)[0-9\s.\-()/,]{4,25}$/;
  return pattern.test(number);
}

/**
 * Resets the error states.
 *
 * @param {HTMLElement} errorElement - The error message element to remove.
 */
function resetErrorState(errorElement, phoneInput) {
  phoneInput.parentNode.parentNode.classList.remove("is-error");
  if (errorElement.parentNode) {
    errorElement.remove();
  }
}

const phoneNumberInput = document.querySelector("input#phone");
const countryInput = document.querySelector("select#country");

if (phoneNumberInput || countryInput) {
  prepareInputFields(phoneNumberInput, countryInput);
}

export default prepareInputFields;
