/*
  Set a unique user_id if the user has accepted cookies.
  If the user has not set their cookie preference, wait for the cookie policy to run first. 
*/

import { v4 as uuidv4 } from "https://jspm.dev/uuid";

const getCookie = (targetCookie) =>
  document.cookie.match(new RegExp("(^| )" + targetCookie + "=([^;]+)"));
let cookieAcceptanceValue = getCookie("_cookies_accepted");

if (!cookieAcceptanceValue) {
  cpNs.cookiePolicy(setUserId);
} else {
  setUserId();
  cpNs.cookiePolicy();
}

function setUserId() {
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

let utmCookies = getCookie("utms");
if (!utmCookies) {
  console.log("Setting UTMs");
  setUtms();
} else {
  console.log("Already set UTM", utmCookies);
}

function setUtms() {
  // No utms cookie, set one if URL has
  const urlParams = new URLSearchParams(window.location.search);
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
    document.cookie = "utms=" + utmParams + ";max-age=86400;";
  }
};