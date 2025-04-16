import {
  getCustomerInfo,
  postCustomerInfoToStripeAccount,
} from "./advantage/api/contracts.js";
import { countries } from "./advantage/countries-and-states.js";

const accountId = window.accountId;

// This partially replicates the functionality of the modal.js file.
// We do it so we can control when the modal opens in a predicatable way,
// i.e. after the fetch the data and populate the content.
function createModal({ modalSelector, triggerButton }) {
  const modal = document.getElementById(modalSelector);

  let currentDialog = null;
  let lastFocus = null;
  let ignoreFocusChanges = false;
  let focusAfterClose = null;

  function trapFocus(e) {
    if (ignoreFocusChanges) return;
    if (currentDialog.contains(e.target)) {
      lastFocus = e.target;
    } else {
      focusFirstDescendant(currentDialog);
      if (lastFocus == document.activeElement) {
        focusLastDescendant(currentDialog);
      }
      lastFocus = document.activeElement;
    }
  }

  function attemptFocus(child) {
    if (child.focus) {
      ignoreFocusChanges = true;
      child.focus();
      ignoreFocusChanges = false;
      return document.activeElement === child;
    }
    return false;
  }

  function focusFirstDescendant(element) {
    for (let i = 0; i < element.childNodes.length; i++) {
      let child = element.childNodes[i];
      if (attemptFocus(child) || focusFirstDescendant(child)) {
        return true;
      }
    }
    return false;
  }

  function focusLastDescendant(element) {
    for (let i = element.childNodes.length - 1; i >= 0; i--) {
      let child = element.childNodes[i];
      if (attemptFocus(child) || focusLastDescendant(child)) {
        return true;
      }
    }
    return false;
  }

  function open() {
    currentDialog = modal;
    modal.style.display = "flex";
    focusFirstDescendant(modal);
    focusAfterClose = triggerButton;
    document.addEventListener("focus", trapFocus, true);
  }

  function close() {
    modal.style.display = "none";
    if (focusAfterClose && focusAfterClose.focus) {
      focusAfterClose.focus();
    }
    document.removeEventListener("focus", trapFocus, true);
    currentDialog = null;
  }

  document.addEventListener("click", (e) => {
    const inDialog = e.target.closest(".p-modal__dialog");
    const isToggle = e.target.matches("[aria-controls]");
    if ((isToggle && inDialog) || (!inDialog && !isToggle)) close();
  });

  document.addEventListener("keydown", (e) => {
    if (e.code === "Escape") close();
  });

  return { open, close };
}

(function initEditBillingModal() {
  const triggerButton = document.querySelector("#edit-billing-btn");
  const saveButton = document.querySelector("#save-modal-btn");
  const errorContainer = document.querySelector("#error-container");
  const form = document.querySelector("#edit-billing-form");

  const modal = createModal({
    modalSelector: "edit-billing-modal",
    triggerButton: triggerButton,
  });

  function setVatError(isError) {
    form
      .querySelector("#vat-invalid-error")
      .classList.toggle("u-hide", !isError);
  }

  function setErrorNotification(isError) {
    errorContainer.classList.toggle("u-hide", !isError);
  }

  function setRequiredError(input, isError) {
    const group = input.closest(".p-form__group");
    const errorMessage = input.nextElementSibling;
    group.classList.toggle("is-error", isError);
    input.ariaInvalid = isError;
    input.setAttribute("aria-describedby", isError ? errorMessage.id : "");
    errorMessage.classList.toggle("u-hide", !isError);
  }

  function validateForm() {
    let isValid = true;

    // Do not allow empty values
    for (const el of form.elements) {
      const group = el.closest(".p-form__group");
      // Unless it is hidden
      if (group.classList.contains("u-hide")) continue;
      const errorMessage = el.nextElementSibling;

      const isEmpty = el.value.trim() === "";
      if (isEmpty) {
        isValid = false;
        setRequiredError(el, true);
      } else {
        setRequiredError(el, false);
      }
    }

    return isValid;
  }

  function findCountryName(countryCode) {
    const country = countries.find((c) => c.value === countryCode);
    return country ? country.label : "";
  }

  function findCountryCode(countryName) {
    const country = countries.find((c) => c.label === countryName);
    return country ? country.value : "";
  }

  function clearErrors() {
    setVatError(false);
    setErrorNotification(false);
    for (const el of form.elements) {
      setRequiredError(el, false);
    }
  }

  function setSaving(isSaving) {
    saveButton.classList.toggle("is-processing", isSaving);
    saveButton.innerHTML = isSaving
      ? '<i class="p-icon--spinner u-animation--spin is-light"></i>'
      : "Save";
  }

  async function load() {
    const json = await getCustomerInfo(accountId);
    const info = json.data.customerInfo;

    const vat = info.taxID?.value ?? "";
    const country = findCountryName(info.address.country);
    const name = info.name ?? "";
    const address = info.address?.line1 ?? "";
    const city = info.address?.city ?? "";
    const postalCode = info.address?.postal_code ?? "";

    form.querySelector("#country").textContent = country;
    // Some countries do not have a VAT number, so we hide the field
    if (!vat) {
      form.elements["vat"].closest(".p-form__group").classList.add("u-hide");
    }
    form.elements["vat"].value = vat;
    form.elements["name"].value = name;
    form.elements["address"].value = address;
    form.elements["city"].value = city;
    form.elements["postal-code"].value = postalCode;
  }

  async function submit() {
    const data = new FormData(form);
    const country = form.querySelector("#country").textContent;

    const payload = {
      accountID: accountId,
      address: {
        line1: data.get("address"),
        city: data.get("city"),
        postal_code: data.get("postal-code"),
        country: findCountryCode(country),
      },
      name: data.get("name"),
      taxID: {
        value: data.get("vat"),
        type: country === "ZA" ? "za_vat" : "eu_vat",
      },
    };

    try {
      setSaving(true);
      const result = await postCustomerInfoToStripeAccount(payload);
      if (result.errors?.includes("tax_id_invalid")) {
        // VAT number is the only field in this modal that may raise
        // validation errors. We show the error message in the field.
        setVatError(true);
        return;
      }
      if (result.errors) throw new Error();
    } catch (error) {
      // If there is still an error, show a generic error message
      setErrorNotification(true);
    } finally {
      setSaving(false);
    }
  }

  triggerButton.addEventListener("click", async (e) => {
    clearErrors();
    await load();
    modal.open();
  });

  saveButton.addEventListener("click", async (e) => {
    clearErrors();
    const isValid = validateForm();
    if (!isValid) return;
    await submit();
  });
})();
