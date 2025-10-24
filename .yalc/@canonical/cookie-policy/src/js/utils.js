import { content } from "./content.js";

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

export const setCookie = (value) => {
  const d = new Date();
  d.setTime(d.getTime() + 365 * 24 * 60 * 60 * 1000);
  const expires = "expires=" + d.toUTCString();
  const samesite = "samesite=lax;";
  const path = "path=/;";
  document.cookie =
    "_cookies_accepted=" + value + "; " + expires + "; " + samesite + path;
  if (enabledTracking(value)) {
    pushPageview();
  }
};

export const getCookie = () => {
  const toMatch = "_cookies_accepted=";
  const splitArray = document.cookie.split(";");
  let cookieValue = "";
  let currentCookieValue = "";
  for (let i = 0; i < splitArray.length; i++) {
    let cookie = splitArray[i];
    while (cookie.charAt(0) == " ") {
      cookie = cookie.substring(1);
    }
    currentCookieValue = cookie.substring(toMatch.length, cookie.length);
    if (cookie.indexOf(toMatch) === 0 && currentCookieValue !== "true") {
      cookieValue = currentCookieValue;
    }
  }
  return cookieValue;
};

export const preferenceNotSelected = () => {
  const cookieValue = getCookie("_cookies_accepted");
  // Skip a value of "true" to override old existing cookies
  if (cookieValue && cookieValue != "true") {
    return false;
  } else {
    return true;
  }
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
  const cookieValue = getCookie("_cookies_accepted");
  cookieValue && setGoogleConsentPreferences(cookieValue);
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

const enabledTracking = (selectedPreference) => {
  if (selectedPreference == "all" || selectedPreference == "performance") {
    return true;
  } else {
    return false;
  }
};

    
/**
  Toggles the necessary aria- attributes' values on the accordion panels
  and handles to show or hide them.
  @param {HTMLElement} element The tab that acts as the handles.
  @param {Boolean} show Whether to show or hide the accordion panel.
*/
function toggleExpanded(element, show) {
  var target = document.getElementById(element.getAttribute('aria-controls'));

  if (target) {
    element.setAttribute('aria-expanded', show);
    target.setAttribute('aria-hidden', !show);
  }
}

/**
  Attaches event listeners for the accordion open and close click events.
  @param {HTMLElement} accordionContainer The accordion container element.
*/
export const setupAccordion = (accordionContainer) => {
  // Finds any open panels within the container and closes them.
  function closeAllPanels() {
    var openPanels = accordionContainer.querySelectorAll('[aria-expanded=true]');

    for (var i = 0, l = openPanels.length; i < l; i++) {
      toggleExpanded(openPanels[i], false);
    }
  }

  // Set up an event listener on the container so that panels can be added
  // and removed and events do not need to be managed separately.
  accordionContainer.addEventListener('click', function(event) {
    var target = event.target;

    if (target.closest) {
      target = target.closest('[class*="p-accordion__tab"]');
    }

    if (target) {
      var isTargetOpen = target.getAttribute('aria-expanded') === 'true';

      // Toggle visibility of the target panel.
      toggleExpanded(target, !isTargetOpen);
    }
  });
}
