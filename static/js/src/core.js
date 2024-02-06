import { createNav } from "@canonical/global-nav";
import { cookiePolicy } from "@canonical/cookie-policy";

// Initalise the global navigation.
createNav({
  showLogins: false,
  hiring: "https://canonical.com/careers/start",
  maxWidth: "80rem",
});

// Initalise the cookie policy notification.
cookiePolicy();
