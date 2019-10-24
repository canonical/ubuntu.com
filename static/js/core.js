import { createNav } from "@canonical/global-nav";
import cpNs from "./cookie-proxy";

// Initalise the global navigation.
createNav();

// Initalise the cookie policy notification.
cpNs.cookiePolicy.setup({
  content: `We use cookies to improve your experience. By your continued use of
      this site you accept such use.<br /> This notice will disappear by
      itself.`,
  duration: 10000
});
