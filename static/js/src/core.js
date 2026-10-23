import { cookiePolicy } from "@canonical/cookie-policy";
import { createNav } from "@canonical/global-nav";
import { removeFontFaces } from "./remove-font-faces";

// The global nav injects Vanilla's @font-face rules, which replace the local fonts
const navStyle = [...document.head.querySelectorAll("style")].find((style) =>
  style.textContent.startsWith(".global-nav"),
);
if (navStyle) removeFontFaces(navStyle.sheet);

createNav({
  breakpoint: 1150,
  mobileContainerSelector: ".global-nav-mobile",
  desktopContainerSelector: ".global-nav-desktop",
});
