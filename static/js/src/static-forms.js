function setUpStaticForms(form, formId) {
  /**
   *
   * @param {Node[]} otherContainers
   *
   * Attaches event listeners to the "other" checkboxes/radios in
   * the form to reveal a text input when selected, and hide
   * it when unselected
   */
  function setUpOtherContainers(otherContainers) {
    function updateOtherInputVisibility(otherInput, textInput) {
      if (otherInput.checked) {
        textInput.classList.remove("u-hide");
        textInput.focus();
      } else {
        textInput.classList.add("u-hide");
        textInput.value = "";
      }
    }

    Array.prototype.forEach.call(otherContainers, function (otherContainer) {
      const otherInput = otherContainer.querySelector(
        ".js-other-container__other-toggle"
      );
      const textInput = otherContainer.querySelector(
        ".js-other-container__input"
      );

      if (otherInput.type === "radio") {
        const radioGroupName = otherInput.name;
        const radioGroup = Array.from(
          document.querySelectorAll(`input[name="${radioGroupName}"]`)
        );
        radioGroup.forEach((radio) => {
          radio.addEventListener("change", () =>
            updateOtherInputVisibility(otherInput, textInput)
          );
        });
      } else if (otherInput.type === "checkbox") {
        otherInput.addEventListener("change", () =>
          updateOtherInputVisibility(otherInput, textInput)
        );
      }
    });
  }
  const otherContainers = document.querySelectorAll(".js-other-container");
  if (otherContainers?.length) {
    setUpOtherContainers(otherContainers);
  }

  /**
   *
   * Get the user's default language, and if it's a sub-language,
   * infer the parent language - e.g. for "en-GB", infer "en"
   */
  function getPrimaryParentLanguage() {
    let language =
      navigator.language ||
      navigator.userLanguage ||
      navigator.browserLanguage ||
      navigator.systemLanguage;

    if (language.indexOf("-") !== -1) {
      if (language !== "zh-TW") {
        language = language.split("-")[0];
      }
    }

    return language;
  }
  const preferredLanguageInput = document.querySelector("#preferredLanguage");
  if (preferredLanguageInput) {
    preferredLanguageInput.value = getPrimaryParentLanguage() || "";
  }

  /**
   *
   * @param {number} formId
   *
   * Builds a message from the form fields and populates the
   * Comments from Lead field
   */
  function buildCommentsForLead(formId) {
    var message = "";

    form?.addEventListener("submit", (e) => {
      var message = "";
      var commentsFromLead = document.querySelector("#Comments_from_lead__c");
      var formFields = document.querySelectorAll(".js-formfield");
      formFields.forEach(function (formField) {
        var comma = ",";
        var colon = ": ";
        var fieldTitle = formField.querySelector(".p-heading--3");
        var inputs = formField.querySelectorAll("input, textarea");
        if (fieldTitle) {
          message += fieldTitle.innerText + "\r\n";
        }

        inputs.forEach(function (input) {
          var question = input.name.split("-").join(" ");
          switch (input.type) {
            case "radio":
              if (input.checked) {
                message += question + colon + input.value + comma + "\r\n\r\n";
              }
              break;
            case "checkbox":
              if (input.checked) {
                message += question + colon + input.value + comma + "\r\n\r\n";
              }
              break;
            case "text":
              if (input.value !== "") {
                message += question + colon + input.value + comma + "\r\n\r\n";
              }
              break;
            case "number":
              if (input.value !== "") {
                message += question + colon + input.value + comma + "\r\n\r\n";
              }
              break;
            case "textarea":
              if (input.value !== "") {
                message += question + colon + input.value + comma + "\r\n\r\n";
              }
              break;
          }
          input.removeAttribute("name");
        });
      });

      if (formFields.length) {
        commentsFromLead.value = message;
      }
      return message;
    });
  }
  const commentsFromLead = document.querySelector("#Comments_from_lead__c");
  if (commentsFromLead) {
    buildCommentsForLead(formId);
  }

  /**
   *
   * @param {Node} submitButton
   *
   * Attaches a loading spinner to the submit button on
   * form submission
   */
  function attachLoadingSpinner(submitButton) {
    const spinnerIcon = document.createElement("i");
    spinnerIcon.className = "p-icon--spinner u-animation--spin is-light";
    const buttonRect = submitButton.getBoundingClientRect();
    submitButton.style.width = buttonRect.width + "px";
    submitButton.style.height = buttonRect.height + "px";
    submitButton.classList.add("is-processing");
    submitButton.disabled = true;
    submitButton.innerText = "";
    submitButton.appendChild(spinnerIcon);
  }
  const submitButton = form.querySelector('button[type="submit"]');
  // Exclude forms that don't need loader
  const cancelLoader = submitButton.classList.contains("no-loader");
  if (submitButton && !cancelLoader) {
    form.addEventListener("submit", () => attachLoadingSpinner(submitButton));
  }
}

/**
 *
 * @param {*} str
 * @returns {number} Marketo ID
 */
function extractMarketoID(str) {
  var matches = str.match(/\d+/);
  if (matches) {
    return parseInt(matches[0], 10);
  }
  return null;
}

const forms = document.querySelectorAll("form[action='/marketo/submit']");
if (forms.length) {
  forms.forEach((form) => setUpStaticForms(form, extractMarketoID(form.id)));
}
