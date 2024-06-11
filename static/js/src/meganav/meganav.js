import keyboardNavigationHandler from "./keyboard-events";
import attachGAEvents from "./ga-events";

const navigation = document.querySelector(".p-navigation--sliding");
const topLevelNavDropdowns = Array.from(
  document.querySelectorAll(
    ".p-navigation__item--dropdown-toggle:not(.global-nav__dropdown-toggle):not(.js-back)"
  )
);
const mainList = document.querySelector("nav.p-navigation__nav");
const dropdownWindow = document.querySelector(".dropdown-window");
const dropdownWindowOverlay = document.querySelector(
  ".dropdown-window-overlay"
);
let dropdowns = [];

/**
 * If JS is disabled, we want to apply slightly different styles
 */
navigation.classList.add("js-enabled");

/**
 * Once the document has loaded, we want to set up the global navigation
 */
document.addEventListener("DOMContentLoaded", () => {
  setUpGlobalNav();
});

/**
 * If the url has a hash, we want to open the dropdown that matches the hash
 */
window.addEventListener("DOMContentLoaded", () => {
  handleUrlHash();
});

/**
 * Setup functions for keyboard navigation and trapping
 */
function addKeyboardEvents() {
  document.addEventListener("keydown", keyboardNavigationHandler);
}

function removeKeyboardEvents() {
  document.removeEventListener("keydown", keyboardNavigationHandler);
}

//Helper functions

function toggleIsActiveState(element, active) {
  element.classList.toggle("is-active", active);
}

const MOBILE_VIEW_BREAKPOINT = 1212;
function isMobile() {
  const currViewportWidth = window.innerWidth;
  const isMobile = currViewportWidth < MOBILE_VIEW_BREAKPOINT;
  return isMobile;
}

function addClassesToElements(elements, classes) {
  elements.forEach((element, index) => element.classList.add(classes[index]));
}

function removeClassesFromElements(elements, classes) {
  elements.forEach((element, index) =>
    element.classList.remove(classes[index])
  );
}

function getAllElements(queryString) {
  const lists = [...dropdowns, mainList];
  let listItems = [];
  lists.forEach(function (list) {
    const items = list.querySelectorAll(queryString);
    listItems = [...items, ...listItems];
  });
  return listItems;
}

/**
 * Handles clicks on the navigation items
 */
mainList.addEventListener("click", function (e) {
  e.preventDefault();
  let target = e.target;
  if (target.classList.contains("p-navigation__link")) {
    if (target.classList.contains("js-back")) {
      goBackOneLevel(e, target);
    } else {
      handleDropdownClick(e.target.parentNode);
    }
  } else if (
    target.classList.contains("p-navigation__dropdown-item") ||
    target.classList.contains("p-navigation__secondary-link") ||
    target.classList.contains("p-button--positive")
  ) {
    if (target.tagName === "A" || target.firstChild.tagName === "A") {
      window.location.href = target.href;
    }
  }
});

let wasBelowSpecificWidth = window.innerWidth < MOBILE_VIEW_BREAKPOINT;
window.addEventListener("resize", function () {
  // Only closeAll if the resize event crosses the MOBILE_VIEW_BREAKPOINT threshold
  const currViewportWidth = window.innerWidth;
  const isBelowSpecificWidth = currViewportWidth < MOBILE_VIEW_BREAKPOINT;
  if (wasBelowSpecificWidth !== isBelowSpecificWidth) {
    closeAll();
  }
  wasBelowSpecificWidth = isBelowSpecificWidth;
});

dropdownWindowOverlay?.addEventListener("click", () => {
  if (dropdownWindow.classList.contains("is-active")) {
    closeAll();
  }
});

function handleDropdownClick(clickedDropdown) {
  const isActive = clickedDropdown.classList.contains("is-active");
  updateNavigation(clickedDropdown, !isActive);
  setTabIndex(clickedDropdown.querySelector("ul.p-navigation__dropdown"));
}

/**
 * This is needed as the onhover/onfocus effect does not work with touch screens, but will trigger calling the navigation contents. We then need to manually open the dropdown. See https://developer.mozilla.org/en-US/docs/Web/API/MutationObserver/MutationObserver
 */
function handleMutation(mutationsList, observer) {
  mutationsList.forEach((mutation) => {
    if (mutation.type === "childList") {
      handleDropdownClick(mutation.target);
      observer.disconnect();
    }
  });
}

/**
 * Function to update the state of mobile and desktop dropdowns
 * @param {HTMLNode} dropdown <li class="p-navigation__item--dropdown-toggle">
 */
function updateNavigation(dropdown, show) {
  let isNested = dropdown.parentNode.classList.contains(
    "p-navigation__dropdown"
  );
  // we check if the mobile dropdown content has been loaded
  const contentLoaded = document.getElementById(
    dropdown.id + "-content-mobile"
  );
  if (!contentLoaded) {
    // if content isn't fetched, we set up an observer to wait for it to load before updating
    const observer = new MutationObserver(handleMutation);
    const observerConfig = { childList: true, subtree: true };
    observer.observe(dropdown, observerConfig);
  } else if (isMobile()) {
    updateMobileNavigation(dropdown, show, isNested);
    updateWindowHeight();
  } else {
    closeAll();
    // Delay the animation to allow the dropdown to slide in
    const ANIMATION_DELAY = 150;
    updateDesktopNavigation(dropdown, show, isNested, ANIMATION_DELAY);
    showDesktopDropdownContainer(show);
  }
  updateUrlHash(dropdown.id, show);
}

// MOBILE DROPDOWN FUNCTIONS
const menuButtons = document.querySelectorAll(".js-menu-button");
if (menuButtons) {
  menuButtons.forEach((menuButton) =>
    menuButton.addEventListener("click", toggleMenu)
  );
}

function toggleMenu(e) {
  e.preventDefault();

  if (navigation.classList.contains("has-menu-open")) {
    closeAll();
  } else {
    closeAll();
    openMenu(e);
  }
}

/**
 * Updates the state of the mobile dropdown
 * @param {Event} e
 * @param {HTMLNode} dropdown <li class="p-navigation__item--dropdown-toggle">
 */
function updateMobileNavigation(dropdown, show) {
  let dropdownContentMobile = document.getElementById(
    dropdown.id + "-content-mobile"
  );
  if (dropdownContentMobile) {
    dropdownContentMobile.setAttribute("aria-hidden", !show);
    toggleIsActiveState(dropdownContentMobile.parentNode.parentNode, show);
    toggleIsActiveState(dropdownContentMobile.parentNode, show);
  }
}

/**
 * Triggered when a back button is pressed, update the state of the mobile dropdowns
 * @param {Event} e
 * @param {HTMLNode} backButton <li class="p-navigation__item--dropdown-close">
 */
function goBackOneLevel(e, backButton) {
  e.preventDefault();
  const target = backButton.parentNode.parentNode;
  target.setAttribute("aria-hidden", true);
  toggleIsActiveState(backButton.closest(".is-active"), false);
  toggleIsActiveState(backButton.closest(".is-active"), false);
  setTabIndex(target.parentNode.parentNode);

  if (target.parentNode.getAttribute("role") == "menuitem") {
    updateNavigation(target.parentNode, false);
  }
  updateWindowHeight();
}

/**
 * Gets the current height of the URL bar. This is to account for differences between device URL bar heights
 * @param {HTMLNode} element
 */
function getUrlBarHeight(element) {
  const visibleHeight = window.innerHeight;
  const fullHeight = document.querySelector("#control-height").clientHeight;
  const barHeight = fullHeight - visibleHeight;
  return barHeight;
}

/**
 * Updates the height of the navigation to fit the exact space of the screen based on the URL bar height.
 */
const navEle = document.querySelector(".p-navigation__nav");
const originalMaxHeight = navEle.style.maxHeight;
function updateWindowHeight() {
  navEle.style.maxHeight = originalMaxHeight;
  const isInDropdownList = mainList.classList.contains("is-active");
  if (isInDropdownList) {
    const newHeight = navEle.clientHeight - getUrlBarHeight() - 20 + "px";
    navEle.style.maxHeight = newHeight;
  } else {
    navEle.style.maxHeight = originalMaxHeight;
  }
}

/**
 * Resets the various states of the mobile dropdowns
 */
function closeMobileDropdown() {
  const dropdownElements = getAllElements(
    ".p-navigation__item--dropdown-toggle"
  );
  navigation.classList.remove("has-menu-open");
  mainList.classList.remove("is-active");
  if (secondaryNav) {
    toggleSecondaryMobileNavDropdown();
  }
  dropdownElements.forEach((dropdown) => {
    if (dropdown.classList.contains("is-active")) {
      toggleIsActiveState(dropdown, false);
      const listItem = dropdown.querySelector("ul.p-navigation__dropdown");
      listItem.setAttribute("aria-hidden", true);
      toggleIsActiveState(listItem, false);
    }
  });
}

/**
 * Opens the mobile dropdown
 * @param {Event} e
 */
function openMenu(e) {
  e.preventDefault();

  menuButtons.forEach((menuButton) => {
    menuButton.setAttribute("aria-pressed", true);
  });

  navigation.classList.add("has-menu-open");
  // document.addEventListener("keyup", keyboardNavigationHandler);
  setTabIndex(mainList);
  addKeyboardEvents();
}

// DESKTOP DROPDOWN FUNCTIONS

/**
 * Toggles which tab is active in the desktop dropdown. Is attached to each tab.
 * @param {Event} e
 */
function toggleSection(e) {
  e.preventDefault();
  const targetId = e.target.getAttribute("aria-controls");
  const el = document.querySelector(`.dropdown-content-desktop #${targetId}`);
  const currTabWindow = el.closest(".dropdown-window__content-container");
  const tabLinks = currTabWindow.querySelectorAll(".p-side-navigation__link");
  tabLinks.forEach((tabLink) => {
    const tabId = tabLink.getAttribute("aria-controls");
    const tabWindow = dropdownWindow.querySelector(`#${tabId}`);
    if (tabId === targetId) {
      el.removeAttribute("hidden");
      tabLink.setAttribute("aria-selected", true);
      tabLink.classList.add("is-active");
    } else {
      tabWindow.setAttribute("hidden", true);
      tabLink.setAttribute("aria-selected", false);
      tabLink.classList.remove("is-active");
    }
  });

  const firstLink = el.querySelector("a");
  setTimeout(function () {
    toggleIsActiveState(el, true);
    firstLink.focus();
  }, 1);
}
window.toggleSection = toggleSection; // make availalble in HTML

function updateDesktopNavigation(dropdown, show, delay) {
  let isNested = dropdown.parentNode.classList.contains(
    "p-navigation__dropdown"
  );
  if (!isNested && show) {
    topLevelNavDropdowns
      .filter((filteredDropdown) => filteredDropdown !== dropdown)
      .forEach((filteredDropdown) => {
        updateDesktopDropdownState(filteredDropdown, !show, delay);
      });
  }
  updateDesktopDropdownState(dropdown, show, delay);
}

function updateDesktopDropdownState(dropdown, show, delay) {
  let dropdownContent = document.getElementById(dropdown.id + "-content");
  toggleIsActiveState(dropdown, show);
  if (dropdownContent) {
    toggleDropdownContentVisibility(dropdownContent, show, delay);
  }
  if (dropdown.id === "all-canonical") {
    toggleGlobalNavVisibility(dropdownContent, show, delay);
  }
}

function toggleDropdownContentVisibility(contentElement, show, delay = 0) {
  if (delay > 0 && !show) {
    setTimeout(() => contentElement.classList.toggle("u-hide", !show), delay);
  } else {
    contentElement.classList.toggle("u-hide", !show);
  }
}

function showDesktopDropdownContainer(show) {
  dropdownWindow.classList.toggle("slide-animation", !show);
  dropdownWindowOverlay.classList.toggle("fade-animation", !show);
  toggleIsActiveState(dropdownWindow, show);
  addKeyboardEvents();
}

function closeDesktopDropdown() {
  showDesktopDropdownContainer(false);
  mainList.classList.remove("is-active");
  [].slice.call(dropdownWindow.children).forEach((dropdownContent) => {
    if (!dropdownContent.classList.contains("u-hide")) {
      dropdownContent.classList.add("u-hide");
    }
  });
}

// SECONDARY NAV FUNCTIONS
const secondaryNav = document.querySelector(".p-navigation.is-secondary");
secondaryNav
  ?.querySelector(".p-navigation__toggle--open")
  ?.addEventListener("click", toggleSecondaryMobileNavDropdown);

function toggleSecondaryMobileNavDropdown(e) {
  const mobileNavDropdown = secondaryNav.querySelector(".p-navigation__nav");
  const mobileNavDropdownToggle = secondaryNav.querySelector(
    ".p-navigation__toggle--open"
  );
  let isDropdownOpen;
  if (e && e.type == "click") {
    e.preventDefault();
    isDropdownOpen = mobileNavDropdown.classList.contains("is-open");
  } else {
    isDropdownOpen = true;
  }
  mobileNavDropdown?.classList.toggle("is-open", !isDropdownOpen);
  mobileNavDropdownToggle?.classList.toggle("is-open", !isDropdownOpen);
}

// FETCH FUNCTIONS

function makeRequest(url, callback) {
  const req = new XMLHttpRequest();
  req.open("GET", url);
  req.addEventListener("load", callback);
  req.send();
}

function convertHTMLToNode(responseText, selector) {
  const tempElement = document.createElement("div");
  tempElement.innerHTML = responseText;
  return tempElement.querySelector(selector);
}

function deactivateActiveCTA(element) {
  toggleIsActiveState(element, false);
}

/**
  Fetches the contents of indervidual, top level, navigation items
  @param {String} url the path to fetch the subsection
  @param {String} id the id of the target subsection
*/
const fetchedMap = {};
function fetchDropdown(url, id) {
  const key = `${url}-${id}`;
  if (fetchedMap[key] === true) return;
  fetchedMap[key] = true;

  const desktopContainer = document.getElementById(id + "-content");
  const mobileContainer = document.getElementById(id);

  if (desktopContainer.innerHTML === "") {
    makeRequest(url, function () {
      const desktopContent = convertHTMLToNode(
        this.responseText,
        ".desktop-dropdown-content"
      );
      desktopContainer.appendChild(desktopContent);

      const mobileContent = convertHTMLToNode(
        this.responseText,
        ".dropdown-content-mobile"
      );
      mobileContainer.appendChild(mobileContent);

      const targetDropdowns = mobileContent.querySelectorAll(
        "ul.p-navigation__dropdown"
      );
      dropdowns = [...dropdowns, ...targetDropdowns];

      const activeCTAs = mobileContainer.querySelectorAll("a.is-active");
      activeCTAs.forEach(deactivateActiveCTA);
    });
  }
}
window.fetchDropdown = fetchDropdown; //make available in HTML

/**
  Updates the tab index of the target group to 0
  @param {HTMLNode} target <ul class="p-navigation__items">
  or <ul class="p-navigation__dropdown">
*/
function setTabIndex(target) {
  if (!target) return;
  const lists = [...dropdowns, mainList];
  lists.forEach((list) => {
    const elements = list.querySelectorAll(
      "ul > li > a, ul > li > button, ul > li > h2"
    );
    elements.forEach(function (element) {
      element.setAttribute("tabindex", "-1");
    });
  });

  const targetLiItems = target?.querySelectorAll("li");
  targetLiItems?.forEach((element) => {
    // function to check if there is a secondary list
    const isSecondaryList = (ele) =>
      ele.classList.contains("p-navigation__secondary-links");
    if (
      (element.parentNode === target &&
        !isSecondaryList(element.children[0])) ||
      (element.parentNode.parentNode.parentNode === target &&
        isSecondaryList(element.parentNode))
    ) {
      element.children[0].setAttribute("tabindex", "0");

      // check for the a second link withint the li
      const downloadButton = element.querySelector(
        ":scope > .p-button--positive"
      );
      if (downloadButton) {
        downloadButton.setAttribute("tabindex", "0");
      }
    }
  });

  // We have to handle the top level items differently as they are shared between the mobile and desktop dropdowns
  const currActiveNavItem = navigation.querySelector(
    ".p-navigation__item--dropdown-toggle.is-active"
  );
  if (currActiveNavItem) {
    currActiveNavItem.children[0].setAttribute("tabindex", "0");
  } else {
    mainList.querySelectorAll(":scope > ul > li").forEach((element) => {
      element.children[0]?.setAttribute("tabindex", "0");
    });
  }
}

/**
 * Close all navigations and reset states
 */
function closeNavigations() {
  menuButtons.forEach((searchButton) => {
    searchButton.removeAttribute("aria-pressed");
  });
  closeMobileDropdown();
  closeDesktopDropdown();
  removeKeyboardEvents();
}

/**
 * Master switch to close and reset everything
 */
export function closeAll() {
  closeSearch();
  closeNavigations();
  updateUrlHash();
  setTabIndex(mainList);
  updateWindowHeight();
}

/**
 * Updates the URL hash with the current position in the navigation
 * @param {String} id - the id of the target dropdown
 * @param {Boolean} open - whether the dropdown is open or closed
 */
function updateUrlHash(id, open) {
  if (id && open) {
    window.history.pushState(
      null,
      document.title,
      window.location.pathname + window.location.search + `#${id}`
    );
  } else {
    window.history.pushState(
      null,
      document.title,
      window.location.pathname + window.location.search
    );
  }
}

/**
 * Checks if a hash is present in the URL and opens the corresponding dropdown
 */
function handleUrlHash() {
  const targetId = window.location.hash;
  const targetDropdown = targetId ? navigation.querySelector(targetId) : null;
  if (targetDropdown) {
    if (isMobile()) {
      const menuToggle = navigation.querySelector(".js-menu-button");
      menuToggle?.click();
    } else {
      targetDropdown.focus();
    }
    fetchDropdown("/templates/meganav/" + targetDropdown.id, targetDropdown.id);
    handleDropdownClick(targetDropdown);
  }
}

// SEARCH FUNCTIONS

function initNavigationSearch() {
  searchButtons.forEach((searchButton) =>
    searchButton.addEventListener("click", toggleSearch)
  );

  const searchOverlay = document.querySelector(".p-navigation__search-overlay");
  searchOverlay.addEventListener("click", toggleSearch);
}

function toggleSearch(e) {
  e.preventDefault();
  if (navigation.classList.contains("has-search-open")) {
    closeAll();
  } else {
    closeAll();
    openSearch(e);
  }
}

function openSearch(e) {
  e.preventDefault();
  const searchInput = navigation.querySelector(".p-search-box__input");
  Array.from(searchButtons).forEach((searchButton) => {
    searchButton.setAttribute("aria-pressed", true);
  });

  navigation.classList.add("has-search-open");
  if (secondaryNav) {
    secondaryNav.classList.add("u-hide");
  }
  searchInput.focus();
  document.addEventListener("keyup", keyboardNavigationHandler);
}

function closeSearch() {
  searchButtons.forEach((searchButton) => {
    searchButton.removeAttribute("aria-pressed");
  });

  navigation.classList.remove("has-search-open");
  if (secondaryNav) {
    secondaryNav.classList.remove("u-hide");
  }

  document.removeEventListener("keyup", keyboardNavigationHandler);
}

const searchButtons = document.querySelectorAll(".js-search-button");
initNavigationSearch();

// GLOBAL NAV FUNCTIONS

document.addEventListener("global-nav-opened", () => {
  dropdownWindow.classList.add("slide-animation");
  dropdownWindowOverlay.classList.add("fade-animation");
  topLevelNavDropdowns.forEach((dropdown) => updateNavigation(dropdown, false));
});

function setUpGlobalNav() {
  const globalNavTab = document.querySelector(".global-nav-mobile");
  const globalNavMainTab = globalNavTab.querySelector("ul.p-navigation__items");

  globalNavMainTab.classList.replace("u-hide", "dropdown-content-mobile");
  globalNavMainTab.classList.replace(
    "p-navigation__items",
    "p-navigation__dropdown"
  );

  globalNavMainTab.setAttribute("id", "all-canonical-content-mobile");

  globalNavTab
    .querySelectorAll(".p-navigation__dropdown")
    .forEach((dropdown) => {
      dropdown.setAttribute("aria-hidden", "true");
      const dropdownToggle = dropdown.closest(
        ".p-navigation__item--dropdown-toggle"
      );
      if (dropdownToggle.getAttribute("role") != "menuitem") {
        const newDropdownId = `all-canonical-${dropdown.id}`;
        dropdown.setAttribute("id", `${newDropdownId}-content-mobile`);
        dropdownToggle.setAttribute("id", newDropdownId);
        dropdownToggle
          .querySelector("button.p-navigation__link")
          .setAttribute("href", `#${newDropdownId}-content-mobile`);
      }
      const tempHTMLContainer = document.createElement("div");
      tempHTMLContainer.innerHTML = `<li class="p-navigation__item--dropdown-close" id="${dropdown.id}-back">
        <button class="p-navigation__link js-back" href="${dropdown.id}" aria-controls="${dropdown.id}" tabindex="-1">
          Back
        </button>
      </li>`;
      const backButton = tempHTMLContainer.firstChild.cloneNode(true);
      dropdown.prepend(backButton);
    });
}

function toggleGlobalNavVisibility(dropdown, show, delay) {
  const globalNavContent = dropdown.querySelector(".global-nav-dropdown");
  const globalNavInnerContent = dropdown.querySelector(
    ".global-nav-dropdown__content"
  );
  if (show) {
    globalNavInnerContent.classList.remove("u-hide");
    globalNavInnerContent.setAttribute("aria-hidden", !show);
    setTimeout(() => {
      globalNavContent.classList.add("show-content");
    }, delay);
  } else {
    globalNavContent.classList.remove("show-content");
    globalNavInnerContent.setAttribute("aria-hidden", show);
    setTimeout(() => {
      globalNavInnerContent.classList.add("u-hide");
    }, delay);
  }
}

// UBUNTU ONE ACCOUNT FUNCTIONS

var accountContainer = document.querySelector(".js-account");
if (accountContainer) {
  fetch("/account.json")
    .then((response) => response.json())
    .then((data) => {
      if (data.account === null) {
        accountContainer.innerHTML = `<a href="/login" class="p-navigation__link" style="padding-right: 1rem;" tabindex="0" onclick="event.stopPropagation()">Sign in</a>`;
      } else {
        window.accountJSONRes = data.account;
        accountContainer.innerHTML = `<a href="#" class="p-navigation__link is-signed-in" aria-controls="canonical-login-content-mobile" aria-expanded="false" aria-haspopup="true">Account</a>
          <ul class="p-navigation__dropdown" id="canonical-login-content-mobile" aria-hidden="true">
            <li class="p-navigation__item--dropdown-close" id="canonical-login-back">
              <a class="p-navigation__link js-back" href="canonical-login-content-mobile" aria-controls="canonical-login-content-mobile" tabindex="-1"">
                Back
              </a>
            </li>
            <li class="p-navigation__dropdown-item u-no-padding--bottom">
              <h2 class="p-text--small">Logged in as <br/>
              <strong>${data.account.email}</strong></h2>
            </li>
            <li class="p-navigation__dropdown-item"><a class="p-link--inverted" href="/pro/dashboard" onclick="event.stopPropagation()">Ubuntu Pro dashboard</a></li>
            <li class="p-navigation__dropdown-item">
              <a class="p-link--inverted" href="/account/invoices" onclick="event.stopPropagation()">Invoices & Payments</a>
            </li>
            <li class="p-navigation__dropdown-item">
              <a class="p-link--inverted" href="https://login.ubuntu.com/" onclick="event.stopPropagation()">Account settings</a>
            </li>
            <li class="p-navigation__dropdown-item">
              <a class="p-link--inverted" href="/logout" onclick="event.stopPropagation()">Logout</a>
            </li>
          </ul>`;
      }
    });
}

// ATTACH GA EVENTS

attachGAEvents();
