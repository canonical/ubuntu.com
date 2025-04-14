import {
  getCustomerInfo,
  postCustomerInfoToStripeAccount,
} from "./advantage/api/contracts.js";
import { countries } from "./advantage/countries-and-states.js";

const accountId = window.accountId;

// This partially replicates the functionality of the modal.js file.
// We do it so we can control when the modal opens in a predicatable way,
// i.e. after the fetch the data and populate the content.
function Modal({ modalSelector }) {
  let currentDialog = null;
  let lastFocus = null;
  let ignoreFocusChanges = false;
  let focusAfterClose = null;
  const modal = document.getElementById(modalSelector);

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

  function toggleModal(sourceEl, open) {
    if (open) {
      currentDialog = modal;
      modal.style.display = "flex";
      focusFirstDescendant(modal);
      focusAfterClose = sourceEl;
      document.addEventListener("focus", trapFocus, true);
    } else {
      modal.style.display = "none";
      if (focusAfterClose && focusAfterClose.focus) {
        focusAfterClose.focus();
      }
      document.removeEventListener("focus", trapFocus, true);
      currentDialog = null;
    }
  }

  function open(sourceEl) {
    toggleModal(sourceEl, true);
  }

  function close() {
    toggleModal(false, false);
  }

  document.addEventListener("click", (e) => {
    const inDialog = e.target.closest(".p-modal__dialog");
    const isToggle = e.target.matches("[aria-controls]");
    if ((isToggle && inDialog) || (!inDialog && !isToggle)) {
      close();
    }
  });

  document.addEventListener("keydown", (e) => {
    if (e.code === "Escape") close();
  });

  return { open, close };
}

function ErrorNotification() {
  const errorContainer = document.querySelector("#error-container");

  return {
    display: (message) => {
      if (message) {
      errorContainer.querySelector(".p-notification__message").textContent =
        message;
      };
      errorContainer.classList.remove("u-hide");
    },
    clear: () => {
      errorContainer.classList.add("u-hide");
    },
  };
}

const editBillingModal = Modal({
  modalSelector: "edit-billing-modal",
});
const errorNotification = ErrorNotification();

const editBillingDetailsBtn = document.querySelector("#edit-billing-btn");
editBillingDetailsBtn.addEventListener("click", async (e) => {
  try {
    const payload = await getCustomerInfo(accountId);
    const customerInfo = payload.data.customerInfo;
    populateForm(customerInfo);
    editBillingModal.open(e.target);
  } catch (error) {
    errorNotification.display();
  }

  async function populateForm(data) {
    const form = document.querySelector("#edit-billing-form");
    const foundCountry = countries.find(
      (c) => c.value === data.address.country,
    );
    const country = form.querySelector("#country");
    country.textContent = foundCountry.label ?? "";
    form.elements["vat"].value = data.taxID.value ?? "";
    form.elements["name"].value = data.name ?? "";
    form.elements["address"].value = data.address.line1 ?? "";
    form.elements["city"].value = data.address.city ?? "";
    form.elements["postal-code"].value = data.address.postal_code ?? "";
    form.elements["country-code"].value = data.address.country ?? "";
    form.elements["payment-method-id"].value =
      data.defaultPaymentMethod.id ?? "";
  }
});

const saveBtn = document.getElementById("save-modal-btn");
saveBtn.addEventListener("click", async (e) => {
  try {
    const form = document.querySelector("#edit-billing-form");
    const formData = new FormData(form);
    const data = await updateBillingDetails(formData);
    if (data.errors) {
      errorNotification.display(
        "The details provided are not valid. Please check and try again.",
      );
    } else {
      errorNotification.clear();
    }
  } catch (error) {
    errorNotification.display();
  } finally {
    editBillingModal.close();
  }

  async function updateBillingDetails(formData) {
    const vatNumber = formData.get("vat");
    const name = formData.get("name");
    const address = formData.get("address");
    const city = formData.get("city");
    const postalCode = formData.get("postal-code");
    const country = formData.get("country-code");
    const paymentMethodID = formData.get("payment-method-id");

    const data = await postCustomerInfoToStripeAccount({
      paymentMethodID: paymentMethodID,
      accountID: accountId,
      address: {
        line1: address,
        city: city,
        postal_code: postalCode,
        country: country,
      },
      name: name,
      taxID: {
        value: vatNumber,
      },
    });

    return data;
  }
});
