import { createNav } from "@canonical/global-nav";
import { cookiePolicy } from "@canonical/cookie-policy";

// Initalise the global navigation.
createNav({ showLogins: false });

// Initalise the cookie policy notification.

cookiePolicy();
