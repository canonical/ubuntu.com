import { Notification } from "./notification.js";
import { Manager } from "./manager.js";
import {
  preferenceNotSelected,
  hideSpecified,
  addGoogleConsentMode,
  loadConsentFromCookie,
} from "./utils.js";

// Add Google Consent Mode as soon as the script is loaded
addGoogleConsentMode();

export const cookiePolicy = (callback = null) => {
  let cookiePolicyContainer = null;
  let language = document.documentElement.lang;
  let initialised = false;

  const renderNotification = function (e) {
    if (e) {
      e.preventDefault();
    }

    if (cookiePolicyContainer === null) {
      cookiePolicyContainer = document.createElement("dialog");
      cookiePolicyContainer.classList.add("cookie-policy");
      cookiePolicyContainer.style.pointerEvents = "none";
      cookiePolicyContainer.setAttribute("open", true);
      cookiePolicyContainer.style.borderStyle = "none";
      document.body.appendChild(cookiePolicyContainer);
      const notification = new Notification(
        cookiePolicyContainer,
        renderManager,
        close
      );
      notification.render(language);
      document.getElementById("cookie-policy-button-accept-all").focus();
    }
  };

  const renderManager = function () {
    const manager = new Manager(cookiePolicyContainer, close);
    manager.render(language);
  };

  const close = function () {
    if (typeof callback === "function") {
      callback();
    }
    document.body.removeChild(cookiePolicyContainer);
    cookiePolicyContainer = null;
  };

  const init = function () {
    if (initialised) return;
    initialised = true;

    // Load the consent from the cookie, if available
    loadConsentFromCookie();

    const revokeButton = document.querySelector(".js-revoke-cookie-manager");
    if (revokeButton) {
      revokeButton.addEventListener("click", renderNotification);
    }

    if (preferenceNotSelected() && !hideSpecified()) {
      renderNotification();
    }
  };

  if (document.readyState === "loading") {
    // If the document is still loading, listen for DOMContentLoaded
    document.addEventListener("DOMContentLoaded", init, false);
  } else {
    // Otherwise the script was triggered after the document was loaded, so we can run it immediately
    init();
  }
};
