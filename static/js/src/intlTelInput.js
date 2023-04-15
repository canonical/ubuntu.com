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
  
  // add validation
  function reset() {
    phoneInput.style.backgroundColor = "#f5f5f5";
  }

  function isValidNumber(number) {
    const pattern = /^[0-9]*$/;
    return number.length >= 10 && number.length <= 20 && pattern.test(number);
  }

  // on blur: validate
  phoneInput.addEventListener("blur", function () {
    reset();
    if (phoneInput.value.trim()) {
      if (isValidNumber(phoneInput.value.trim())) {
        reset();
      } else {
        phoneInput.style.backgroundColor = "rgba(225, 35, 35, 0.25)";
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
