import { v4 as uuidv4 } from "https://jspm.dev/uuid";
// Set user_id after cookie acceptance
function setUserId() {
  const getCookie = (targetCookie) =>
    document.cookie.match(new RegExp("(^| )" + targetCookie + "=([^;]+)"));
  const cookieAcceptanceValue = getCookie("_cookies_accepted");

  if (
    cookieAcceptanceValue?.[2] === "all" ||
    cookieAcceptanceValue?.[2] === "performance"
  ) {
    // Check if user doesn't already have a user_id
    if (!getCookie("user_id")) {
      // Generate a universally unique identifier
      const user_id = uuidv4();
      document.cookie = "user_id=" + user_id + ";max-age=31536000;";
    }
  }
}
cpNs.cookiePolicy(setUserId);
