import intlTelInput from "intl-tel-input";

let iti;

/**
 * Initializes phone input field with intlTelInput and pre-fills the country input based on the user's timezone.
 *
 * @param {HTMLElement} phoneInput - The input element for the phone number.
 * @param {HTMLElement} countryInput - The select element for the country.
 */
export async function prepareInputFields(phoneInput, countryInput) {
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
export function setupIntlTelInput(countryCode, phoneInput) {
  iti = intlTelInput(phoneInput, {
    utilsScript: "/static/js/dist/utils.js",
    separateDialCode: true,
    hiddenInput: (phoneInputName) => ({
      phone: phoneInputName,
    }),
    initialCountry: countryCode.toLowerCase(),
  });

  phoneInput.removeAttribute("name"); // Ensure only the hidden input is submitted.
  addInputValidation(phoneInput);
}

/**
 * Adds validation logic and styling to the phone input field.
 *
 * @param {HTMLElement} phoneInput - The input element for the phone number.
 */
function addInputValidation(phoneInput) {
  const mobileInput = document.querySelector(".iti");
  const parentNode = mobileInput.parentNode;
  parentNode.classList.add("p-form-validation");

  // remove rogue li item from intlTelInput library
  setTimeout(() => {
    const listItems = parentNode.querySelectorAll("li");
    listItems[listItems.length - 1]?.remove();
  }, 2000);

  phoneInput.classList.add("p-form-validation__input");
  const errorElement = createErrorMessage();
  phoneInput.addEventListener("blur", () =>
    validateInput(phoneInput, errorElement),
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
    phoneInput.setAttribute("aria-describedby", "invalid-number-message");
  }
}

/**
 * Checks the phone number is valid.
 *
 * @param {string} number - The phone number to validate.
 * @returns {boolean} - True if the number is valid, otherwise false.
 */
function isValidNumber(number) {
  if (iti) return iti.isValidNumber();
  const pattern = /^(?=[^a-zA-Z]*$)[0-9\s.\-()/,]{4,25}$/;
  return pattern.test(number);
}

/**
 * Resets the error states.
 *
 * @param {HTMLElement} errorElement - The error message element to remove.
 */
function resetErrorState(errorElement, phoneInput) {
  phoneInput?.parentNode?.parentNode.classList.remove("is-error");
  phoneInput?.removeAttribute("aria-describedby", "invalid-number-message");
  if (errorElement.parentNode) {
    errorElement.remove();
  }
}

// This block checks for the presence of 'phone number' and 'country' input fields on the page. If either input field exists, it triggers the `prepareInputFields` function to set them up. Note: In a modal form scenario, these inputs are not present at page load and thus, `prepareInputFields` is not invoked here. Instead, the function is imported and executed within `dynamic-forms.js` when the modal is opened.
const phoneNumberInput = document.querySelector("input#phone");
const countryInput = document.querySelector("select#country");

if (phoneNumberInput || countryInput) {
  prepareInputFields(phoneNumberInput, countryInput);
}

/**
 * Initializes 'other' inputs. Where selecting the input triggers a textarea to appear.
 */
function setupOtherInputs() {
  const otherTextarea = document.querySelectorAll(".js-other-input");
  otherTextarea.forEach((textarea) => {
    const triggerInputEle = document.querySelector(
      `#${textarea.dataset.inputId}`,
    );
    document
      .querySelectorAll(`[name=${triggerInputEle.name}]`)
      .forEach((input) => {
        input.onclick = () => {
          if (input.type === "radio") {
            if (input == triggerInputEle) {
              textarea.classList.remove("u-hide");
            } else {
              textarea.value = "";
              textarea.classList.add("u-hide");
            }
          } else if (input.type === "checkbox") {
            if (input === triggerInputEle) {
              if (input.checked) {
                textarea.classList.remove("u-hide");
              } else {
                textarea.value = "";
                textarea.classList.add("u-hide");
              }
            }
          }
        };
      });
    textarea.addEventListener("input", () => {
      triggerInputEle.value = textarea.value;
    });
  });
}
setupOtherInputs();

export default {
  prepareInputFields,
  setupIntlTelInput,
};
