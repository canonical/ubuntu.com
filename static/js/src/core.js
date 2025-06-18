import { cookiePolicy } from "@canonical/cookie-policy";
import { createNav } from "@canonical/global-nav";

createNav({
  breakpoint: 1150,
  mobileContainerSelector: ".global-nav-mobile",
  desktopContainerSelector: ".global-nav-desktop",
});
