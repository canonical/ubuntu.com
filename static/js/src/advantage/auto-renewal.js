import { setAutoRenewal } from "./contracts-api.js";

function confirmChanges() {
  const enabledRadio = document.getElementById("auto-renewal-on");
  const subscriptionId = this.dataset.subscriptionId;

  setAutoRenewal(subscriptionId, enabledRadio.checked).catch((error) => {
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
}

const confirmButton = document.getElementById("renewal-confirm");
const cancelButton = document.getElementById("renewal-cancel");

confirmButton.addEventListener("click", confirmChanges);
cancelButton.addEventListener("click", cancelChanges);
