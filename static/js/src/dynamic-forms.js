/**
 * This script is used to load dynamic contact forms on the website.
 * Important notes about using dynamic forms:
 * - Form fields that should be in the payload must have "name" attribute for the input fields.
 * - "js-formfield" class should be used to encapsulate fields that do not have "name" attributes. These fields will be consolidated and added to the "Comments_from_lead__c" payload.
 * - "Comments_from_lead__c" must be a hidden field.
 */
import "infer-preferred-language.js";
import { prepareInputFields } from "./prepare-form-inputs.js";

(function () {
  document.addEventListener("DOMContentLoaded", function () {
    const triggeringHash = "#get-in-touch";
    const formContainer = document.getElementById("contact-form-container");
    const contactButtons = document.querySelectorAll(".js-invoke-modal");
    let returnData = window.location.pathname + "#success";
    const contactModalSelector = "contact-modal";
    const modalAlreadyExists = document.querySelector(".js-modal-ready");

    contactButtons.forEach(function (contactButton) {
      contactButton.addEventListener("click", function (e) {
        e.preventDefault();
        if (window.location.pathname) {
          formContainer.setAttribute("data-return-url", returnData);
        }

        if (contactButton.dataset.formLocation) {
          fetchForm(contactButton.dataset, contactButton);
        } else {
          fetchForm(formContainer.dataset);
        }
        open();
      });
    });

    // recaptcha submitCallback
    window.CaptchaCallback = function () {
      let recaptchas = [].slice.call(
        document.querySelectorAll("div[class^=g-recaptcha]"),
      );
      recaptchas.forEach(function (field) {
        if (!field.hasAttribute("data-widget-id")) {
          let siteKey = field.getAttribute("data-sitekey");
          const recaptchaWidgetId = grecaptcha.render(field, {
            sitekey: siteKey,
          });
          field.setAttribute("data-widget-id", recaptchaWidgetId);
        }
      });
    };

    // Fetch, load and initialise form
    function fetchForm(formData, contactButton) {
      // check if the modal already exists on the page and if so, skip the fetch and initialise it
      if (modalAlreadyExists) {
        returnData = formContainer.dataset.returnUrl;
        initialiseFormData(formContainer.dataset, contactButton);
      } else {
        fetch(formData.formLocation)
          .then(function (response) {
            return response.text();
          })
          .then(function (text) {
            formContainer.innerHTML = text
              .replace(/%% formid %%/g, formData.formId)
              .replace(/%% returnURL %%/g, formData.returnUrl);

            if (formData.title) {
              const title = document.getElementById("modal-title");
              title.innerHTML = formData.title;
            }
            initialiseFormData(formData, contactButton);
          })
          .catch(function (error) {
            console.log("Request failed", error);
          });
      }
    }

    function initialiseFormData(formData, contactButton) {
      formContainer.classList.remove("u-hide");
      setProductContext(contactButton);
      setUTMs(formData.formId);
      setGclid();
      setFBclid();
      loadCaptchaScript();
      initialiseForm();
      setFocus();
    }

    // Load the google recaptcha noscript
    function loadCaptchaScript() {
      const head = document.head;
      const script = document.createElement("script");
      script.type = "text/javascript";
      script.src =
        "https://www.google.com/recaptcha/api.js?onload=CaptchaCallback&render=explicit";
      head.appendChild(script);
    }

    // Open the contact us modal
    function open() {
      updateHash(triggeringHash);
      dataLayer.push({
        event: "interactive-forms",
        action: "open",
        path: window.location.pathname,
      });
    }

    // Removes the triggering hash
    function updateHash(hash) {
      const location = window.location;
      if (location.hash !== hash || hash === "") {
        if ("pushState" in history) {
          history.pushState(
            "",
            document.title,
            location.pathname + location.search + hash,
          );
        } else {
          location.hash = hash;
        }
      }
    }

    function setProductContext(contactButton) {
      // Capture current path and stringify
      // eg. /kubernetes/install -> kubernetes-install
      // fallbacks to "global"
      let product =
        window.location.pathname.split("/").slice(1).join("-") || "global";
      // If present, override with product parameter from button URL
      if (contactButton) {
        contactButton.search.split("&").forEach(function (param) {
          if (param.startsWith("product") || param.startsWith("?product")) {
            product = param.split("=")[1];
          }
        });
      }

      // Set product in form field
      const productContext = document.getElementById("product-context");
      if (productContext) {
        productContext.value = product;
      }
    }

    function setUTMs(formId) {
      const params = new URLSearchParams(window.location.search);
      const targetForm = document.getElementById(`mktoForm_${formId}`);
      const utm_campaign = targetForm.querySelector("#utm_campaign");
      if (utm_campaign) {
        utm_campaign.value = params.get("utm_campaign");
      }
      const utm_source = targetForm.querySelector("#utm_source");
      if (utm_source) {
        utm_source.value = params.get("utm_source");
      }
      const utm_medium = targetForm.querySelector("#utm_medium");
      if (utm_medium) {
        utm_medium.value = params.get("utm_medium");
      }
      const utm_content = targetForm.querySelector("#utm_content");
      if (utm_content) {
        utm_content.value = params.get("utm_content");
      }
      const utm_term = targetForm.querySelector("#utm_term");
      if (utm_term) {
        utm_term.value = params.get("utm_term");
      }
    }

    function setGclid() {
      if (localStorage.getItem("gclid")) {
        const gclidField = document.getElementById("GCLID__c");
        const gclid = JSON.parse(localStorage.getItem("gclid"));
        const isGclidValid = new Date().getTime() < gclid.expiryDate;
        if (gclid && isGclidValid && gclidField) {
          gclidField.value = gclid.value;
        }
      }
    }

    function setFBclid() {
      if (localStorage.getItem("fbclid")) {
        const fbclidField = document.getElementById("Facebook_Click_ID__c");
        const fbclid = JSON.parse(localStorage.getItem("fbclid"));
        const fbclidIsValid = new Date().getTime() < fbclid.expiryDate;
        if (fbclid && fbclidIsValid && fbclidField) {
          fbclidField.value = fbclid.value;
        }
      }
    }

    function setDataLayerConsentInfo(form) {
      const dataLayer = window.dataLayer || [];
      const latestConsentUpdateElements = dataLayer
        .slice()
        .reverse()
        .filter(
          (item) =>
            typeof item === "object" &&
            item !== null &&
            item[0] === "consent" &&
            item[1] === "update",
        )[0][2];

      if (latestConsentUpdateElements) {
        const consentInfoValue = JSON.stringify(latestConsentUpdateElements);
        var consentInfo = document.createElement("input");
        consentInfo.setAttribute("type", "text");
        consentInfo.setAttribute("name", "Google_Consent_Mode__c");
        consentInfo.setAttribute("value", consentInfoValue);
        consentInfo.setAttribute("hidden", "true");
        consentInfo.setAttribute("class", "u-no-margin u-no-padding");
        form.appendChild(consentInfo);
      }
    }

    function initialiseForm() {
      let contactIndex = 1;
      const contactModal = document.getElementById(contactModalSelector);
      const closeModal = document.querySelector(".p-modal__close");
      const closeModalButton = document.querySelector(".js-close");
      const modalPaginationButtons =
        contactModal.querySelectorAll(".pagination a");
      const paginationContent = contactModal.querySelectorAll(".js-pagination");
      const submitButton = contactModal.querySelector('button[type="submit"]');
      const comment = contactModal.querySelector("#Comments_from_lead__c");
      const otherContainers = document.querySelectorAll(".js-other-container");
      const phoneNumberInput = document.querySelector("#phone");
      const countryInput = document.querySelector("#country");
      const modalTrigger = document.activeElement || document.body;
      const isMultipage =
        contactModal.querySelector(".js-pagination")?.length > 1;

      document.onkeydown = function (evt) {
        evt = evt || window.event;
        if (evt.keyCode == 27) {
          close();
        }
      };

      contactModal.addEventListener("submit", function (e) {
        addLoadingSpinner();
        setDataLayerConsentInfo(e.target);
        if (!isMultipage) {
          comment.value = createMessage(true);
        }
      });

      if (closeModal) {
        closeModal.addEventListener("click", function (e) {
          e.preventDefault();
          close();
        });
      }

      if (closeModalButton) {
        closeModalButton.addEventListener("click", function (e) {
          e.preventDefault();
          close();
        });
      }

      if (contactModal) {
        let isClickStartedInside = false;
        contactModal.addEventListener("mousedown", function (e) {
          isClickStartedInside = e.target.id !== contactModalSelector;
        });
        contactModal.addEventListener("mouseup", function (e) {
          if (!isClickStartedInside && e.target.id === contactModalSelector) {
            e.preventDefault();
            close();
          }
        });
      }

      modalPaginationButtons.forEach(function (modalPaginationButton) {
        modalPaginationButton.addEventListener("click", function (e) {
          e.preventDefault();
          const button = e.target.closest("a");
          let index = contactIndex;
          if (button.classList.contains("pagination__link--previous")) {
            index = index - 1;
            setState(index);
            dataLayer.push({
              event: "interactive-forms",
              action: "goto:" + index,
              path: window.location.pathname,
            });
          } else {
            index = index + 1;
            setState(index);
            dataLayer.push({
              event: "interactive-forms",
              action: "goto:" + index,
              path: window.location.pathname,
            });
          }
        });
      });

      otherContainers.forEach(function (otherContainer) {
        const checkbox = otherContainer.querySelector(
          ".js-other-container__checkbox",
        );
        const input = otherContainer.querySelector(
          ".js-other-container__input",
        );
        checkbox?.addEventListener("change", function (e) {
          if (e.target.checked) {
            input.style.display = "block";
            input.focus();
          } else {
            input.style.display = "none";
            input.value = "";
          }
        });
      });

      // Updates the index and renders the changes
      function setState(index) {
        contactIndex = index;
        render();
      }

      // Close the modal and set the index back to the first stage
      function close() {
        setState(1);
        formContainer.classList.add("u-hide");
        modalTrigger.focus();
        updateHash("");
        dataLayer.push({
          event: "interactive-forms",
          action: "close",
          path: window.location.pathname,
        });
      }

      // Update the content of the modal based on the current index
      function render() {
        comment.value = createMessage(false);

        if (paginationContent.length) {
          const currentContent = contactModal.querySelector(
            ".js-pagination--" + contactIndex,
          );
          paginationContent.forEach(function (content) {
            content.classList.add("u-hide");
          });
          currentContent.classList.remove("u-hide");
        }
      }

      // Concatinate the options selected into a string
      function createMessage(submit) {
        const contactModal = document.getElementById("contact-modal");
        let message = "";
        if (contactModal) {
          const formFields = contactModal.querySelectorAll(".js-formfield");
          formFields.forEach(function (formField) {
            const comma = ",";
            const fieldsetForm = formField.querySelector(".js-formfield-title");
            let fieldTitle = "";
            if (fieldsetForm) {
              fieldTitle = fieldsetForm;
            } else {
              fieldTitle =
                formField.querySelector(".p-heading--5") ??
                formField.querySelector(".p-modal__question-heading");
            }
            const inputs = formField.querySelectorAll("input, textarea");
            if (fieldTitle) {
              message += fieldTitle.innerText + "\r\n";
            }

            inputs.forEach(function (input) {
              switch (input.type) {
                case "select-one":
                  message +=
                    input.options[input.selectedIndex]?.textContent +
                    comma +
                    " ";
                  break;
                case "radio":
                  if (input.checked) {
                    message += input.value + comma + " ";
                  }
                  break;
                case "checkbox":
                  if (input.checked) {
                    if (fieldsetForm) {
                      message += input.value + comma + " ";
                    } else {
                      // Forms that have column separation
                      let subSectionText = "";
                      if (
                        input.closest('[class*="col-"]') &&
                        input
                          .closest('[class*="col-"]')
                          .querySelector(".js-sub-section")
                      ) {
                        let subSection = input
                          .closest('[class*="col-"]')
                          .querySelector(".js-sub-section");
                        subSectionText = subSection.innerText + ": ";
                      }

                      let label = formField.querySelector(
                        "span#" + input.getAttribute("aria-labelledby"),
                      );

                      if (label) {
                        label = subSectionText + label.innerText;
                      } else {
                        label = input.getAttribute("aria-labelledby");
                      }
                      message += label + comma + "\r\n\r\n";
                    }
                  }
                  break;
                case "text":
                case "number":
                case "textarea":
                  if (
                    input.value !== "" &&
                    !input.classList.contains("js-other-input")
                  ) {
                    message += input.value + comma + " ";
                  }
                  break;
              }
            });
            message += "\r\n\r\n";
          });

          const radioFieldsets = document.querySelectorAll(
            ".js-remove-radio-names",
          );
          if (radioFieldsets.length > 0) {
            radioFieldsets.forEach((radioFieldset) => {
              const radioInputs = radioFieldset.querySelectorAll(
                "input[type='radio']",
              );
              radioInputs.forEach((radioInput) => {
                radioInput.removeAttribute("name");
              });
            });
          }

          const checkboxFieldsets = document.querySelectorAll(
            ".js-remove-checkbox-names",
          );
          if (checkboxFieldsets.length > 0) {
            checkboxFieldsets.forEach((checkboxFieldset) => {
              const checkboxInputs = checkboxFieldset.querySelectorAll(
                "input[type='checkbox']",
              );
              checkboxInputs.forEach((checkboxInput) => {
                checkboxInput.removeAttribute("name");
              });
            });
          }

          return message;
        }
      }

      // Toggles the description textarea field for radio buttons
      function setupRadioDescriptionFields() {
        const radioGroups = document.querySelectorAll(".js-radio-group");

        radioGroups.forEach((radioGroup) => {
          const radioButtons = radioGroup.querySelectorAll("[type='radio']");

          const descriptionToggle = radioGroup.querySelector(
            ".js-toggle-description-field",
          );

          const descriptionField = document.getElementById(
            descriptionToggle.dataset.descriptionFieldId,
          );

          radioButtons.forEach((radioButton) => {
            radioButton.addEventListener("change", (e) => {
              if (
                e.currentTarget === descriptionToggle &&
                e.currentTarget.checked
              ) {
                descriptionField.classList.remove("u-hide");
              } else {
                descriptionField.classList.add("u-hide");
              }
            });
          });
        });
      }

      setupRadioDescriptionFields();

      // Sets a limit of checkboxes and disables remaining fields
      function setCheckboxLimit() {
        const choiceLimitContainers =
          document.querySelectorAll(".js-choice-limit");

        const checkedChoices = (choices) => {
          return Array.from(choices).filter((choice) => {
            return choice.checked;
          });
        };

        const uncheckedChoices = (choices) => {
          return Array.from(choices).filter((choice) => {
            return !choice.checked;
          });
        };

        const handleChoiceLimitContainer = (choiceLimitContainer) => {
          const choiceLimit = choiceLimitContainer.dataset.choiceLimit;
          const choices =
            choiceLimitContainer.querySelectorAll("[type='checkbox']");

          choices.forEach((choice) => {
            choice.addEventListener("change", () => {
              if (checkedChoices(choices).length >= choiceLimit) {
                uncheckedChoices(choices).forEach((c) => {
                  c.setAttribute("disabled", true);
                });
              } else {
                uncheckedChoices(choices).forEach((c) => {
                  c.removeAttribute("disabled");
                });
              }
            });
          });
        };

        choiceLimitContainers.forEach(handleChoiceLimitContainer);
      }

      setCheckboxLimit();

      // Sets up dial code dropdown options aka. intlTelInput.js
      // and pre fills the country field
      // Prepares input fields for opened modal if it has not been initialised
      if (!modalAlreadyExists) {
        prepareInputFields(phoneNumberInput, countryInput);
      }

      // Set preferredLanguage hidden input
      function setpreferredLanguage() {
        const preferredLanguage = getPrimaryParentLanguage();
        const preferredLanguageInput =
          contactModal.querySelector("#preferredLanguage");

        if (preferredLanguageInput) {
          preferredLanguageInput.value = preferredLanguage || "";
        }
      }

      setpreferredLanguage();

      // Disables submit button and adds visual queue when it is submitted
      function addLoadingSpinner() {
        const modalForm = formContainer.querySelector("form");
        const spinnerIcon = document.createElement("i");
        spinnerIcon.className = "p-icon--spinner u-animation--spin is-light";
        const buttonRect = submitButton.getBoundingClientRect();
        submitButton.style.width = buttonRect.width + "px";
        submitButton.style.height = buttonRect.height + "px";
        submitButton.disabled = true;
        submitButton.innerText = "";
        submitButton.appendChild(spinnerIcon);
      }

      function fireLoadedEvent() {
        const event = new CustomEvent("contactModalLoaded");
        document.dispatchEvent(event);
      }

      fireLoadedEvent();

      // Add event listeners to toggle checkbox visibility
      const ubuntuVersionCheckboxes = document.querySelector(
        "fieldset.js-toggle-checkbox-visibility",
      );
      ubuntuVersionCheckboxes?.addEventListener("change", function (event) {
        toggleCheckboxVisibility(ubuntuVersionCheckboxes, event.target);
      });

      // Add event listeners to required fieldset
      const requiredFieldset = document.querySelectorAll(
        "fieldset.js-required-checkbox",
      );
      requiredFieldset?.forEach((fieldset) => {
        fieldset.addEventListener("change", function (event) {
          requiredCheckbox(fieldset, event.target);
        });
      });

      // Prefill user names and email address if they are logged in
      if (window.accountJSONRes) {
        const names = window.accountJSONRes.fullname.split(" ");
        const firstName = names[0];
        const lastName = names[names.length - 1];

        const emailFields = document.querySelectorAll("input#email");
        emailFields.forEach((field) => {
          field.value = window.accountJSONRes.email;
        });

        const firstNameFields = document.querySelectorAll("input#firstName");
        firstNameFields.forEach((field) => {
          field.value = firstName;
        });

        const lastNameFields = document.querySelectorAll("input#lastName");
        lastNameFields.forEach((field) => {
          field.value = lastName;
        });
      }
    }

    // Sets the focus inside the modal and trap it
    function setFocus() {
      const modalTrigger = document.activeElement || document.body;
      const modal = document.querySelector(".p-modal");
      const firstFocusableEle = modal.querySelector(
        "button, [href], input, select, textarea, [tabindex]:not([tabindex='-1'])",
      );

      // set initial focus inside the modal
      firstFocusableEle.focus();

      // trap focus
      firstFocusableEle.addEventListener("keydown", function (e) {
        if (e.shiftKey && e.key === "Tab") {
          e.preventDefault();
          const targetPage = modal.querySelector(".js-pagination:not(.u-hide)");
          const targetEle = targetPage.querySelector(".pagination__link--next");
          targetEle.focus();
        }
      });

      const modalPages = modal.querySelectorAll(".js-pagination");

      modalPages.forEach(function (page, index) {
        const lastFocusEle = page.querySelector(".pagination__link--next");
        if (lastFocusEle) {
          lastFocusEle.addEventListener("keydown", function (e) {
            if (!e.shiftKey && e.key === "Tab") {
              e.preventDefault();
              firstFocusableEle.focus();
            }
          });
        }
      });
    }

    // Opens the form when the initial hash matches the trigger
    if (window.location.hash === triggeringHash) {
      fetchForm(formContainer.dataset);
      open();
    }

    // Listens for hash changes and opens the form if it matches the trigger
    function locationHashChanged() {
      if (window.location.hash === triggeringHash) {
        fetchForm(formContainer.dataset);
        open();
      }
    }
    window.onhashchange = locationHashChanged;

    /**
     *
     * @param {*} fieldset
     * @param {*} checklistItem
     *
     * Disable & enable checklist visibility based on user selection
     * - When any visible checkbox is checked, it will disable the .js-checkbox-visibility__other checkboxes
     * - Can only check one __other item at a time
     * - When all visible checkboxes or any __other checkbox is unchecked, all checkboxes will be enabled
     */
    function toggleCheckboxVisibility(fieldset, checklistItem) {
      const checkboxes = fieldset.querySelectorAll(".js-checkbox-visibility");
      const otherCheckboxes = fieldset.querySelectorAll(
        ".js-checkbox-visibility__other",
      );
      const isVisible = checklistItem.classList.contains(
        "js-checkbox-visibility",
      );

      if (checklistItem.checked) {
        if (isVisible) {
          otherCheckboxes.forEach((checkbox) => {
            checkbox.disabled = true;
          });
        } else {
          checkboxes.forEach((checkbox) => {
            checkbox.disabled = true;
          });
          otherCheckboxes.forEach((checkbox) => {
            checklistItem == checkbox ? null : (checkbox.disabled = true);
          });
        }
      } else {
        if (isVisible) {
          let uncheck = true;
          checkboxes.forEach((checkbox) => {
            checkbox.checked ? (uncheck = false) : null;
          });
          if (uncheck) {
            otherCheckboxes.forEach((checkbox) => {
              checkbox.disabled = false;
            });
          }
        } else {
          checkboxes.forEach((checkbox) => {
            checkbox.disabled = false;
          });
          otherCheckboxes.forEach((checkbox) => {
            checkbox.disabled = false;
          });
        }
      }
    }

    /**
     *
     * @param {*} fieldset
     * @param {*} target
     * Disables submit button for required checkboxes field
     */
    function requiredCheckbox(fieldset, target) {
      const submitButton = document.querySelector(".js-submit-button");
      const checkboxes = fieldset.querySelectorAll("input[type='checkbox']");
      if (target.checked) {
        submitButton.disabled = false;
      } else {
        let disableSubmit = true;
        checkboxes.forEach((checkbox) => {
          checkbox.checked ? (disableSubmit = false) : null;
        });
        submitButton.disabled = disableSubmit;
      }
    }
  });
})();
