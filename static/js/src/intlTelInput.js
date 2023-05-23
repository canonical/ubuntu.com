import intlTelInput from "intl-tel-input";

// Setup dial code dropdown options (intlTelInput)
function setupIntlTelInput(phoneInput) {
  const utilsScript = "/static/js/dist/utils.js";

  // remove name from original input so only the hidden input is submitted
  const inputName = phoneInput.name;
  phoneInput.removeAttribute("name");

  intlTelInput(phoneInput, {
    utilsScript,
    separateDialCode: true,
    hiddenInput: inputName,
    initialCountry: "auto",
    geoIpLookup: async function fetchUserIp(success, failure) {
      const response = await fetch("/user-country.json");
      if (!response.ok) {
        throw new Error(response.status);
      }
      const JSONObject = await response.json();
      const countryCode =
        JSONObject && JSONObject.country_code ? JSONObject.country_code : "gb";

      success(countryCode);
    },
  });

  // create error message node
  const mobileInput = document.querySelector(".iti");
  mobileInput.parentNode.classList.add("p-form-validation");
  phoneInput.classList.add("p-form-validation__input");
  const errorElement = document.createElement("div");
  errorElement.classList.add("p-form-validation__message");
  errorElement.style.marginTop = "1rem";
  const errorMessage = document.createTextNode("Please enter a valid number.");
  errorElement.appendChild(errorMessage);
  // accessibility improvements
  const countryCodeDropdown = mobileInput.querySelector(".iti__selected-flag");
  countryCodeDropdown.setAttribute("aria-label", "Dial code list");
  phoneInput.setAttribute("aria-describedby", "invalid-number-message");
  errorElement.setAttribute("id", "invalid-number-message");
  errorElement.setAttribute("role", "alert");

  function reset() {
    mobileInput.parentNode.classList.remove("is-error");
    errorElement.remove();
  }

  function isValidNumber(number) {
    const pattern = /^(?=[^a-zA-Z]*$)[0-9\s.\-()/,]{4,25}$/;
    return pattern.test(number);
  }

  // on blur: validate
  phoneInput.addEventListener("blur", function () {
    reset();
    if (phoneInput.value.trim()) {
      if (isValidNumber(phoneInput.value.trim())) {
        reset();
      } else {
        mobileInput.parentNode.classList.add("is-error");
        mobileInput.parentNode.insertBefore(
          errorElement,
          mobileInput.nextSibling
        );
      }
    }
  });

  // on keyup / change flag: reset
  phoneInput.addEventListener("change", reset);
  phoneInput.addEventListener("keyup", reset);
}

const targetPhoneInput = document.querySelector("input#phone");
if (targetPhoneInput) setupIntlTelInput(targetPhoneInput);

export default setupIntlTelInput;
