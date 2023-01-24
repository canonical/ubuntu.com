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
        JSONObject && JSONObject.country_code ? JSONObject.country_code : "UK";
      success(countryCode);
    },
  });
}

const targetPhoneInput = document.querySelector("input#phone");
if (targetPhoneInput) setupIntlTelInput(targetPhoneInput);

export default setupIntlTelInput;
