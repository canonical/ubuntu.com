import { setAutoRenewal } from "./api/contracts.js";

const autoRenewalButton = document.querySelector(".js-reveal-renewal-options");
const chevron = autoRenewalButton.querySelector(".p-icon--contextual-menu");
const autoRenewalSection = document.getElementById("renewal-options");

function toggleAutoRenewalSection() {
  chevron.classList.toggle("u-rotate");
  autoRenewalSection.classList.toggle("u-hide");

  if (autoRenewalButton.getAttribute("aria-expanded") === "true") {
    autoRenewalButton.setAttribute("aria-expanded", "false");
    autoRenewalSection.setAttribute("aria-hidden", "true");
  } else {
    autoRenewalButton.setAttribute("aria-expanded", "true");
    autoRenewalSection.setAttribute("aria-hidden", "false");
  }
}

function confirmChanges() {
  const enabledRadio = document.getElementById("auto-renewal-on");

  setAutoRenewal(enabledRadio.checked)
    .then((data) => {
      dataLayer.push({
        event: "GAEvent",
        eventCategory: "Advantage",
        eventAction: enabledRadio.checked
          ? "toggle-auto-renewal-on"
          : "toggle-auto-renewal-off",
        eventLabel: "Save changes",
        eventValue: undefined
      });
      if (data.errors) {
        console.error(data.errors);
      } else {
        location.reload();
      }
    })
    .catch((error) => {
      console.error(error);
    });
}

function cancelChanges() {
  if (this.dataset.defaultState === "True") {
    const enabledRadio = document.getElementById("auto-renewal-on");
    enabledRadio.checked = true;
  } else {
    const disabledRadio = document.getElementById("auto-renewal-off");
    disabledRadio.checked = true;
  }
  toggleAutoRenewalSection();
}

const confirmButton = document.getElementById("renewal-confirm");
const cancelButton = document.getElementById("renewal-cancel");

confirmButton.addEventListener("click", confirmChanges);
cancelButton.addEventListener("click", cancelChanges);
autoRenewalButton.addEventListener("click", toggleAutoRenewalSection);
