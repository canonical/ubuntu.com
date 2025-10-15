import { Notification } from "./notification.js";
import { Manager } from "./manager.js";
import {
  preferenceNotSelected,
  hideSpecified,
  addGoogleConsentMode,
  loadConsentFromCookie,
  isReturnFromSuccessfulSession,
  extractSessionParameters,
  setCookiesAcceptedCookie,
  setUserUuidCookie,
  redirectNeeded,
  clearUrlParameters,
  getLegacyUserId,
  setSessionLocalMode,
} from "./utils.js";
import {
  redirectToSession,
  getConsentPreferences,
  checkServiceHealth,
} from "./api.js";

// Add Google Consent Mode as soon as the script is loaded
addGoogleConsentMode();

export const cookiePolicy = (callback = null) => {
  let cookiePolicyContainer = null;
  let language = document.documentElement.lang;
  let initialised = false;
  const sessionParams = extractSessionParameters();
  let localMode;

  // Handle return from session endpoint
  const handleReturnFromSession = async function () {
    const { code, user_uuid, preferences_unset, action } = sessionParams;

    if (!code || !user_uuid) {
      return;
    }

    if (preferences_unset !== "true" && action !== "manage-cookies") {
      // User has preferences in DB, so we fetch and set them
      const result = await getConsentPreferences(code, user_uuid);

      if (result.success && result.data.preferences.consent) {
        setCookiesAcceptedCookie(result.data.preferences.consent);
      }
    }

    setUserUuidCookie(user_uuid);
    clearUrlParameters();
  };

  const renderNotification = function (e) {
    if (e) {
      e.preventDefault();
    }

    if (cookiePolicyContainer === null) {
      cookiePolicyContainer = document.createElement("dialog");
      cookiePolicyContainer.classList.add("cookie-policy");
      cookiePolicyContainer.setAttribute("open", true);
      document.body.appendChild(cookiePolicyContainer);
      const notification = new Notification(
        cookiePolicyContainer,
        renderManager,
        close,
        sessionParams,
        localMode
      );
      notification.render(language);
      document.getElementById("cookie-policy-button-accept").focus();
    }
  };

  const renderManager = function () {
    const manager = new Manager(
      cookiePolicyContainer,
      close,
      sessionParams,
      localMode
    );
    manager.render(language);
  };

  const close = function () {
    if (typeof callback === "function") {
      callback();
    }
    document.body.removeChild(cookiePolicyContainer);
    cookiePolicyContainer = null;
  };

  const handleRedirects = async () => {
    // First check if we're returning from a successful redirect session
    if (isReturnFromSuccessfulSession(sessionParams)) {
      await handleReturnFromSession();
      return false;
    }

    // Then we check if we're returning from a failed redirect session
    if (sessionParams.cookie_redirect_success === "false") {
      clearUrlParameters();
      setSessionLocalMode();
      localMode = true;
      return false;
    }

    // Then we check if a redirect is still needed (ie. no local cookies)
    if (redirectNeeded()) {
      const serviceIsUp = await checkServiceHealth();
      if (!serviceIsUp) {
        setSessionLocalMode();
        localMode = true;
        return false;
      }

      // Service is up, proceed with redirect
      const legacyUserId = getLegacyUserId();
      redirectToSession({ legacyUserId });
      return true;
    }

    return false;
  };

  const init = function () {
    if (initialised) return;
    initialised = true;

    // Add preferences to gtag from cookie, if available
    loadConsentFromCookie();

    const revokeButton = document.querySelector(".js-revoke-cookie-manager");
    if (revokeButton) {
      revokeButton.addEventListener("click", (e) => {
        e.preventDefault();
        if (!localMode) {
          redirectToSession({ manageConsent: true });
        } else {
          renderNotification();
        }
      });
    }

    if (
      (preferenceNotSelected() && !hideSpecified()) ||
      sessionParams.action === "manage-cookies"
    ) {
      renderNotification();
    }
  };

  // INIT: First handle any redirects, then initialise the main logic
  handleRedirects().then((redirecting) => {
    if (redirecting) {
      return;
    }

    // Check if DOM is already loaded (happens when returning from session)
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", init, false);
    } else {
      // DOM already loaded, call init immediately
      init();
    }
  });
};
