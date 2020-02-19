import { createNav } from "@canonical/global-nav";
import { cookiePolicy } from "@canonical/cookie-policy";

// Initalise the global navigation.
createNav({ showLogins: false });

// Initalise the cookie policy notification.

var options = {
  content: `We use cookies to improve your experience. By your continued use of
  this site you accept such use.<br /> This notice will disappear by
  itself.`,
  duration: 1000,
};
cookiePolicy(options);
