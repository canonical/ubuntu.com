import { content } from "./content.js";
import { postConsentPreferences } from "./api.js";

const DEFAULT_CONSENT = {
  ad_storage: "denied",
  ad_user_data: "denied",
  ad_personalization: "denied",
  analytics_storage: "denied",
  functionality_storage: "denied",
  personalization_storage: "denied",
  security_storage: "denied",
};

const ESSENTIAL_PREFERENCES = ["security_storage"];

const PERFORMANCE_PREFERENCES = [
  "ad_storage",
  "ad_user_data",
  "ad_personalization",
  "analytics_storage",
];

const FUNCTIONALITY_PREFERENCES = [
  "functionality_storage",
  "personalization_storage",
];

const ALL_PREFERENCES = [
  "ad_storage",
  "ad_user_data",
  "ad_personalization",
  "analytics_storage",
  "functionality_storage",
  "personalization_storage",
];

export const setSessionCookie = (name, value, expiresInDays = null) => {
  const samesite = "samesite=lax;";
  const path = "path=/;";

  let cookieString = name + "=" + value + "; " + samesite + path;

  // If expiresInDays is provided, add expiration date
  if (expiresInDays !== null) {
    const d = new Date();
    d.setTime(d.getTime() + expiresInDays * 24 * 60 * 60 * 1000);
    const expires = "expires=" + d.toUTCString();
    cookieString = name + "=" + value + "; " + expires + "; " + samesite + path;
  }

  document.cookie = cookieString;
};

export const setUserUuidCookie = (userUuid) => {
  // Set user_uuid cookie with 10 years expiration
  setSessionCookie("user_uuid", userUuid, 3650);
};

export const setCookiesAcceptedCookie = (preference, localMode) => {
  // Set _cookies_accepted cookie with 365 days expiration
  // unless central service is unavailable (localMode = true), 
  // then set for the session only
  if (localMode) {
    setSessionCookie("_cookies_accepted", preference);
  } else {
    setSessionCookie("_cookies_accepted", preference, 365);
  }
};

export const storeCookiesPreferences = async ({
  sessionParams,
  preference,
  controlsStore,
  localMode,
}) => {
  let result;

  if (!localMode && sessionParams.code && sessionParams.user_uuid) {
    result = await postConsentPreferences(
      sessionParams.code,
      sessionParams.user_uuid,
      { consent: preference }
    );
  }

  if ((result && result.success) || localMode) {
    setCookiesAcceptedCookie(preference, localMode);

    if (controlsStore) {
      setGoogleConsentFromControls(controlsStore);
    } else {
      setGoogleConsentPreferences(preference);
    }
  }
};

export const getCookieByName = (name) => {
  const toMatch = name + "=";
  const splitArray = document.cookie.split(";");
  for (let i = 0; i < splitArray.length; i++) {
    let cookie = splitArray[i];
    while (cookie.charAt(0) == " ") {
      cookie = cookie.substring(1);
    }
    if (cookie.indexOf(toMatch) === 0) {
      return cookie.substring(toMatch.length, cookie.length);
    }
  }
  return null;
};

export const getUserUuidCookie = () => {
  return getCookieByName("user_uuid");
};

export const getCookiesAcceptedCookie = () => {
  return getCookieByName("_cookies_accepted");
};

export const preferenceNotSelected = () => {
  const cookieValue = getCookiesAcceptedCookie();
  return !cookieValue || cookieValue === "true" || cookieValue === "unset";
};

export const hideSpecified = () => {
  const urlParams = new URLSearchParams(window.location.search);
  const cpQuery = urlParams.get("cp");

  if (cpQuery === "hide") {
    return true;
  } else {
    return false;
  }
};

export const getContent = (language) => {
  if (content[language]) {
    return content[language];
  } else {
    return content["default"];
  }
};

export const getControlsContent = (details, language) => {
  if (details.content[language]) {
    return details.content[language];
  } else {
    return details.content["default"];
  }
};

export const addGoogleConsentMode = () => {
  // Check for existing gtag before adding the default script
  if (!window.gtag) {
    // Run the script to define gtag
    window.dataLayer = window.dataLayer || [];
    window.gtag = function gtag() {
      dataLayer.push(arguments);
    };

    // Set default consent to 'denied' as a placeholder
    window.gtag("consent", "default", DEFAULT_CONSENT);
  }
};

export const loadConsentFromCookie = () => {
  const cookieValue = getCookiesAcceptedCookie();
  if (cookieValue && cookieValue !== "unset") {
    setGoogleConsentPreferences(cookieValue);
  }
};

export const setGoogleConsentFromControls = (controls) => {
  const checkedControls = controls.filter((control) => control.isChecked());

  let updatedConsent = { ...DEFAULT_CONSENT };

  // We combine the preferences into a single object
  checkedControls.forEach((item) => {
    updatedConsent = updateConsentPreferences(updatedConsent, item.id);
  });

  // Insert the script at the bottom of the head section
  runConsentScript(updatedConsent);
};

export const setGoogleConsentPreferences = (selectedPreference) => {
  let updatedConsent = updateConsentPreferences(
    DEFAULT_CONSENT,
    selectedPreference
  );

  // Insert the script at the bottom of the head section
  runConsentScript(updatedConsent);
};

const updateConsentPreferences = (consentObject, selectedPreference) => {
  let updatedConsent = { ...consentObject };

  ESSENTIAL_PREFERENCES.forEach((item) => {
    updatedConsent[item] = "granted";
  });

  if (selectedPreference === "performance") {
    PERFORMANCE_PREFERENCES.forEach((item) => {
      updatedConsent[item] = "granted";
    });
  } else if (selectedPreference === "functionality") {
    FUNCTIONALITY_PREFERENCES.forEach((item) => {
      updatedConsent[item] = "granted";
    });
  } else if (selectedPreference === "all") {
    ALL_PREFERENCES.forEach((item) => {
      updatedConsent[item] = "granted";
    });
  }

  return updatedConsent;
};

const runConsentScript = (consentObject) => {
  // Update preferences
  window.gtag("consent", "update", consentObject);
};

const pushPageview = () => {
  if (typeof dataLayer === "object") {
    dataLayer.push({ event: "pageview" });
  }
};

const hasValidSession = () => {
  const cookieValue = getCookiesAcceptedCookie();
  const userUuid = getUserUuidCookie();
  // Valid session if cookie exists, is not "unset", and user_uuid exists
  return cookieValue && cookieValue !== "unset" && userUuid;
};

const enabledTracking = (selectedPreference) => {
  if (selectedPreference == "all" || selectedPreference == "performance") {
    return true;
  } else {
    return false;
  }
};

// URL Parameter Extraction Utilities
export const getUrlParameter = (name) => {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get(name);
};

export const extractSessionParameters = () => {
  return {
    code: getUrlParameter("code"),
    user_uuid: getUrlParameter("user_uuid"),
    preferences_unset: getUrlParameter("preferences_unset"),
    action: getUrlParameter("action"),
    cookie_redirect_success: getUrlParameter("cookie_redirect_success"),
  };
};

export const isReturnFromSuccessfulSession = (sessionParams) => {
  return sessionParams.cookie_redirect_success === "true";
};

export const clearUrlParameters = () => {
  if (history.replaceState) {
    const url = window.location.pathname + window.location.hash;
    history.replaceState(null, "", url);
  }
};

export const isPreferenceCookieUnset = () => {
  const cookieValue = getCookiesAcceptedCookie();
  return cookieValue === "unset";
};

export const redirectNeeded = function () {
  if (hasValidSession() || hideSpecified()) {
    return false;
  }
  return true;
};

export const getLegacyUserId = () => {
  return getCookieByName("user_id");
};

export const setSessionLocalMode = (localMode) => {
  console.warn(
    "Cookie service is unavailable. Falling back to local mode for this session."
  );
  sessionStorage.setItem("cookie_local_mode", "true");
};
