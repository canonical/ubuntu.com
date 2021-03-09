import { createNav } from "@canonical/global-nav";
import { cookiePolicy } from "@canonical/cookie-policy";
import { assignMarketoBackgroundSubmit } from "./bg-form-submit";

// Initalise the global navigation.
createNav({
  showLogins: false,
  hiring: "https://canonical.com/careers/start",
});

// Initalise the cookie policy notification.
cookiePolicy();

// Add background submit functionality to Marketo forms
assignMarketoBackgroundSubmit();
