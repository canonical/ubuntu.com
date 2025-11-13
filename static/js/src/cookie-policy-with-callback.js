/*
  Set a unique user_id if the user has accepted cookies.
  If the user has not set their cookie preference, wait for the cookie policy to run first. 
*/

import { v4 as uuidv4 } from "https://jspm.dev/uuid";

const getCookie = (targetCookie) =>
  document.cookie.match(new RegExp("(^| )" + targetCookie + "=([^;]+)"));
let cookieAcceptanceValue = getCookie("_cookies_accepted");
let setUserIdCalled = false;

if (!cookieAcceptanceValue) {
  cpNs.cookiePolicy(postUpdatedPreferences);
} else {
  setUserId();
  cpNs.cookiePolicy(postUpdatedPreferences);
  setUtms();
}

function postUpdatedPreferences() {
  console.log("Posting updated cookie preferences to server.");
  const cookieAcceptanceValue = getCookie("_cookies_accepted");

  if (!cookieAcceptanceValue) {
    console.warn("No cookie acceptance value found.");
    return;
  }

  fetch("/cookies/set-preferences", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      preferences: { consent: cookieAcceptanceValue[2] },
    }),
  })
    .then((response) => response.json())
    .catch((err) => console.error("Error sending preferences:", err));

  setUserId();
}

function setUserId() {
  if (setUserIdCalled) return;
  setUserIdCalled = true;
  cookieAcceptanceValue = getCookie("_cookies_accepted");
  if (
    cookieAcceptanceValue?.[2] === "all" ||
    cookieAcceptanceValue?.[2] === "performance"
  ) {
    // Check if user doesn't already have a user_id
    if (!getCookie("user_id")) {
      // Generate a universally unique identifier
      const user_id = uuidv4();
      document.cookie = "user_id=" + user_id + ";max-age=31536000;";

      dataLayer.push({
        user_id: user_id,
      });
    }
  }
}

function setUtmCookies(urlParams) {
  let utmParams = "";
  urlParams.forEach((value, key) => {
    if (key.startsWith("utm_")) {
      utmParams += key + ":" + value + "&";
    }
  });
  if (utmParams.length > 0) {
    if (utmParams.endsWith("&")) {
      utmParams = utmParams.slice(0, -1);
    }
    document.cookie =
      "utms=" + encodeURIComponent(utmParams) + ";max-age=86400;path=/;";
  }
}

function setUtms() {
  cookieAcceptanceValue = getCookie("_cookies_accepted");
  if (
    cookieAcceptanceValue?.[2] === "all" ||
    cookieAcceptanceValue?.[2] === "performance"
  ) {
    let utmCookies = getCookie("utms");
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.size > 0) {
      setUtmCookies(urlParams);
    } else if (utmCookies) {
      const referrer = document.referrer;
      const currentHost = window.location.host;
      if (!referrer.includes(currentHost)) {
        document.cookie = "utms=;max-age=0;path=/;";
      }
    }
  }
}
