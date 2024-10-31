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
