const ANIMATION_DELAY = 200;
const MOBILE_VIEW_BREAKPOINT = 1281;
const dropdownWindow = document.querySelector(".dropdown-window");
const dropdownWindowOverlay = document.querySelector(
  ".dropdown-window-overlay"
);
const searchOverlay = document.querySelector(".p-navigation__search-overlay");
const secondaryNav = document.querySelector(".p-navigation.is-secondary");
const navigation = document.querySelector(".p-navigation--sliding");
const topLevelNavDropdowns = Array.from(
  document.querySelectorAll(
    ".p-navigation__item--dropdown-toggle:not(.global-nav__dropdown-toggle):not(.js-back)"
  )
);
const nav = navigation.querySelector(".js-show-nav");
const menuButtons = document.querySelectorAll(".js-menu-button");
let dropdowns = [];
const mainList = document.querySelector(
  "nav.p-navigation__nav > .p-navigation__items"
);

navigation.classList.add("js-enabled");
nav.classList.remove("u-hide");

//Helper functions

function toggleIsActiveState(element, active) {
  element.classList.toggle("is-active", active);
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

// Attach initial event listeners
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

window.addEventListener("load", closeAll);
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

secondaryNav
  ?.querySelector(".p-navigation__toggle--open")
  ?.addEventListener("click", toggleSecondaryMobileNavDropdown);

document.addEventListener("global-nav-opened", () => {
  addClassesToElements(
    [dropdownWindow, dropdownWindowOverlay],
    ["slide-animation", "fade-animation"]
  );
  topLevelNavDropdowns.forEach((dropdown) => updateNavMenu(dropdown, false));
});

// Event handler functions

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

function handleDropdownClick(clickedDropdown) {
  const isActive = clickedDropdown.classList.contains("is-active");
  updateNavMenu(clickedDropdown, !isActive);
  setTabIndex(clickedDropdown.querySelector("ul.p-navigation__dropdown"));
}

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

function goBackOneLevel(e, backButton) {
  e.preventDefault();
  const target = backButton.parentNode.parentNode;
  target.setAttribute("aria-hidden", true);
  toggleIsActiveState(backButton.closest(".is-active"), false);
  toggleIsActiveState(backButton.closest(".is-active"), false);
  setTabIndex(target.parentNode.parentNode);

  if (target.parentNode.getAttribute("role") == "menuitem") {
    updateNavMenu(target.parentNode, false);
  }
  updateWindowHeight();
}

function escKeyPressHandler(e) {
  if (e.key === "Escape") {
    closeAll();
  }
}

// Attaches to tab items in desktop dropdown and updates them,
// also applies the same update to the mobile dropdown.
// Is attached via HTML onclick attribute.
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

/**
  Function to update the state of mobile and desktop dropdowns
  @param {HTMLNode} dropdown <li class="p-navigation__item--dropdown-toggle">
*/
function updateNavMenu(dropdown, show) {
  let dropdownContent = document.getElementById(dropdown.id + "-content");
  let dropdownContentMobile = document.getElementById(
    dropdown.id + "-content-mobile"
  );
  let isAccountDropdown = dropdown.classList.contains("js-account");

  if (dropdownContent) {
    updateUrlHash(dropdown.id, show);
  }

  // This is needed as the onhover/onfocus effect does not work with touch screens,
  // but will trigger calling the navigation contents. We then need to manually
  // open the dropdown.
  function handleMutation(mutationsList, observer) {
    mutationsList.forEach((mutation) => {
      if (mutation.type === "childList") {
        handleDropdownClick(mutation.target);
        observer.disconnect();
      }
    });
  }

  if ((dropdownContent && dropdownContentMobile) || isAccountDropdown) {
    if (!show) updateDropdownStates(dropdown, show, ANIMATION_DELAY);
    else updateDropdownStates(dropdown, show);
    showDesktopDropdown(show);
  } else if (dropdownContentMobile) {
    updateMobileDropdownState(dropdown, show);
    updateWindowHeight();
  } else {
    const observer = new MutationObserver(handleMutation);
    const observerConfig = { childList: true, subtree: true };
    observer.observe(dropdown, observerConfig);
  }
}

function updateDropdownStates(dropdown, show, delay) {
  let isNested = dropdown.parentNode.classList.contains(
    "p-navigation__dropdown"
  );
  if (!isNested && show) {
    topLevelNavDropdowns
      .filter((filteredDropdown) => filteredDropdown !== dropdown)
      .forEach((filteredDropdown) => {
        updateDesktopDropdownStates(filteredDropdown, !show, delay);
        updateMobileDropdownState(filteredDropdown, !show);
      });
  }
  updateDesktopDropdownStates(dropdown, show, delay);
  updateMobileDropdownState(dropdown, show, isNested);
  updateWindowHeight();
}

function updateDesktopDropdownStates(dropdown, show, delay) {
  let dropdownContent = document.getElementById(dropdown.id + "-content");
  toggleIsActiveState(dropdown, show);
  if (dropdownContent) {
    toggleDropdownContentVisibility(dropdownContent, show, delay);
  }
  if (dropdown.id === "all-canonical") {
    toggleGlobalNavVisibility(dropdownContent, show, delay);
  }
}

function updateMobileDropdownState(dropdown, show, isNested) {
  let dropdownContentMobile = document.getElementById(
    dropdown.id + "-content-mobile"
  );
  if (dropdownContentMobile) {
    dropdownContentMobile.setAttribute("aria-hidden", !show);
    toggleIsActiveState(dropdownContentMobile.parentNode.parentNode, show);
    toggleIsActiveState(dropdownContentMobile.parentNode, show);
  }
}

// Functions to handle visual states

function toggleDropdownContentVisibility(contentElement, show, delay = 0) {
  if (delay > 0 && !show) {
    setTimeout(() => contentElement.classList.toggle("u-hide", !show), delay);
  } else {
    contentElement.classList.toggle("u-hide", !show);
  }
}

function showDesktopDropdown(show) {
  dropdownWindow.classList.toggle("slide-animation", !show);
  dropdownWindowOverlay.classList.toggle("fade-animation", !show);
  toggleIsActiveState(dropdownWindow, show);
  addKeyboardEvents();
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

function getUrlBarHeight(element) {
  const visibleHeight = window.innerHeight;
  const fullHeight = document.querySelector("#control-height").clientHeight;
  const barHeight = fullHeight - visibleHeight;
  return barHeight;
}

// Handles mobile navigation height taking up veiwport space
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

/**
  Updates the tab index of the target group to 0
  @param {HTMLNode} target <ul class="p-navigation__items">
  or <ul class="p-navigation__dropdown">
*/
function setTabIndex(target) {
  const lists = [...dropdowns, mainList];
  lists.forEach((list) => {
    const elements = list.querySelectorAll("ul > li > a, ul > li > button");
    elements.forEach(function (element) {
      element.setAttribute("tabindex", "-1");
    });
  });

  const targetLiItems = target.querySelectorAll("li");
  targetLiItems.forEach((element, index) => {
    if (
      element.parentNode === target ||
      element.parentNode.parentNode === target
    ) {
      element.children[0].setAttribute("tabindex", "0");
    }
  });

  // If on desktop, update the nav items tab index.
  // Keep the active nav item at tabindex 0
  // When none are active, set them all to tabindex 0
  if (window.innerWidth > MOBILE_VIEW_BREAKPOINT) {
    const currActiveNavItem = navigation.querySelector(
      ".p-navigation__item--dropdown-toggle.is-active"
    );
    if (currActiveNavItem) {
      currActiveNavItem.children[0].setAttribute("tabindex", "0");
    } else {
      mainList.querySelectorAll(":scope > li").forEach((element) => {
        element.children[0].setAttribute("tabindex", "0");
      });
    }
  }
}

/** 
  Setup functions for keyboard navigation and trapping
*/
function addKeyboardEvents() {
  document.addEventListener("keydown", keyboardNavigationHandler);
}

function removeKeyboardEvents() {
  document.removeEventListener("keydown", keyboardNavigationHandler);
}

function keyboardNavigationHandler(e) {
  if (e.key === "Escape") {
    handleEscapeKey(e);
  } else if (e.shiftKey && e.key === "Tab") {
    handleShiftTabKey(e);
  } else if (e.key === "Tab") {
    handleTabKey(e);
  }
}

function handleEscapeKey(e) {
  // If '.dropdown-window__sidenav-content' exists we are in the
  // dropdown window so we want to move up to the side-tabs
  const targetTabId = e.target.closest(
    ".dropdown-window__sidenav-content.is-active"
  )?.id;
  if (targetTabId) {
    const targetTab = document.querySelector(
      `.p-side-navigation__link[aria-controls="${targetTabId}"]`
    );
    targetTab?.focus();
    return;
  }

  // Else check if we are in the side-tabs so want to move up to the nav bar items
  const targetDropdownToggleId = e.target.closest(".dropdown-content-desktop")
    ?.id;
  if (targetDropdownToggleId) {
    const targetNavItem = document.querySelector(
      `.p-navigation__link[aria-controls="${targetDropdownToggleId}"]`
    );
    targetNavItem?.focus();
    closeAll();
  }
}

function handleTabKey(e) {
  // Find which dropdown container we are in
  const dropdownPanel = getContainingDropdown(e.target);
  const mobileDropdownPanel = getMobileContainingDropdown(e.target);
  if (mobileDropdownPanel && isLastMobileLinkFocused(e, mobileDropdownPanel)) {
    e.preventDefault();
    const canonicalLogo = navigation.querySelector(
      ".p-navigation__tagged-logo > a"
    );
    canonicalLogo.focus();
  } else if (dropdownPanel && isLastLinkFocused(e, dropdownPanel)) {
    const currDropdownToggle = mainList.querySelector(
      ":scope > .p-navigation__item--dropdown-toggle.is-active"
    );
    const nextDropdownToggleLink =
      currDropdownToggle.nextElementSibling.children[0];
    closeAll();
    e.preventDefault();
    nextDropdownToggleLink.focus();
  }
}

function handleShiftTabKey(e) {
  const dropdownPanel = getContainingDropdown(e.target);
  if (
    isFirstLinkFocused(e, dropdownPanel) &&
    tabPanelExists(e.target) &&
    !isInTabPanel(e.target)
  ) {
    const parentContainer = dropdownPanel.closest(".dropdown-window__content");
    const targetTab = parentContainer.querySelector(
      ".p-side-navigation__item .p-side-navigation__link.is-active"
    );
    if (targetTab) {
      e.preventDefault();
      targetTab?.focus();
    }
  }
}

function isLastLinkFocused(e, dropdownPanel) {
  const listOfLinks = dropdownPanel?.querySelectorAll("a");
  if (listOfLinks?.length > 0) {
    const lastLink = Array.from(listOfLinks).pop();
    return e.target === lastLink;
  }
}

function isLastMobileLinkFocused(e, dropdownPanel) {
  // Find what level of the navigation we are in, 'menuItems' being the top level
  const listOfMenuItems = dropdownPanel?.querySelectorAll(
    "li[role='menuitem']"
  );
  const listOfLinks = Array.from(
    dropdownPanel?.querySelectorAll(":scope > li")
  );
  if (listOfMenuItems?.length > 0) {
    const lastLink = Array.from(listOfMenuItems).pop();
    return e.target === lastLink.firstElementChild;
  } else if (listOfLinks?.length > 0) {
    // Sometimes there is a secondary list of links, so we need to add those to the list
    appendSecondaryListItems(dropdownPanel, listOfLinks);
    const lastLink = Array.from(listOfLinks).pop();
    return e.target === lastLink.firstElementChild;
  }
}

function isFirstLinkFocused(e, dropdownPanel) {
  const listOfLinks = dropdownPanel?.querySelectorAll("a");
  if (listOfLinks?.length > 0) {
    const firstLink = Array.from(listOfLinks).shift();
    return e.target === firstLink;
  }
}

function getContainingDropdown(target) {
  return (
    target.closest(".dropdown-window__sidenav-content") ||
    target.closest(".dropdown-window__content") ||
    target.closest(".global-nav-dropdown__content")
  );
}

function getMobileContainingDropdown(target) {
  return (
    target.closest(".p-navigation__dropdown") ||
    target.closest(".p-navigation__nav >  .p-navigation__items")
  );
}

function isInTabPanel(target) {
  return target.closest(".dropdown-window__tab-panel") ? true : false;
}

function tabPanelExists(target) {
  const parentContainer = target.closest(".dropdown-window__content");
  return parentContainer?.querySelector(".dropdown-window__tab-panel")
    ? true
    : false;
}

function appendSecondaryListItems(dropdownPanel, listOfLinks) {
  const secondaryList = [
    ...(dropdownPanel
      .querySelector(":scope > .p-navigation__secondary-links")
      ?.querySelectorAll("li") || []),
  ];
  if (secondaryList?.length > 0) {
    secondaryList.forEach((listItem) => {
      listOfLinks.push(listItem);
    });
  }
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

function closeNav() {
  menuButtons.forEach((searchButton) => {
    searchButton.removeAttribute("aria-pressed");
  });
  closeMobileDropdown();
  closeDesktopDropdown();
  removeKeyboardEvents();
  document.removeEventListener("keyup", escKeyPressHandler);
}

function closeDesktopDropdown() {
  showDesktopDropdown(false);
  removeClassesFromElements([mainList], ["is-active"]);
  [].slice.call(dropdownWindow.children).forEach((dropdownContent) => {
    if (!dropdownContent.classList.contains("u-hide")) {
      dropdownContent.classList.add("u-hide");
    }
  });
}

function closeMobileDropdown() {
  const dropdownElements = getAllElements(
    ".p-navigation__item--dropdown-toggle"
  );
  removeClassesFromElements(
    [navigation, mainList],
    ["has-menu-open", "is-active"]
  );
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

function closeAll() {
  closeSearch();
  closeNav();
  updateUrlHash();
  setTabIndex(mainList);
  updateWindowHeight();
}

function openMenu(e) {
  e.preventDefault();

  menuButtons.forEach((menuButton) => {
    menuButton.setAttribute("aria-pressed", true);
  });

  navigation.classList.add("has-menu-open");
  document.addEventListener("keyup", escKeyPressHandler);
  setTabIndex(mainList);
  addKeyboardEvents();
}

// Setup and functions for navigation search
function initNavigationSearch() {
  searchButtons.forEach((searchButton) =>
    searchButton.addEventListener("click", toggleSearch)
  );

  searchOverlay.addEventListener("click", toggleSearch);

  if (menuButtons) {
    menuButtons.forEach((menuButton) =>
      menuButton.addEventListener("click", toggleMenu)
    );
  }
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

  addClassesToElements([navigation], ["has-search-open"]);
  if (secondaryNav) {
    addClassesToElements([secondaryNav], ["u-hide"]);
  }
  searchInput.focus();
  document.addEventListener("keyup", escKeyPressHandler);
}

function closeSearch() {
  searchButtons.forEach((searchButton) => {
    searchButton.removeAttribute("aria-pressed");
  });

  navigation.classList.remove("has-search-open");

  if (secondaryNav) {
    secondaryNav.classList.remove("u-hide");
  }

  document.removeEventListener("keyup", escKeyPressHandler);
}

const searchButtons = document.querySelectorAll(".js-search-button");
const overlay = document.querySelector(".p-navigation__search-overlay");
initNavigationSearch();

// Setup global-nav
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
document.addEventListener("DOMContentLoaded", () => {
  setUpGlobalNav();
});

// Initiate login
var accountContainer = document.querySelector(".js-account");
if (accountContainer) {
  fetch("/account.json")
    .then((response) => response.json())
    .then((data) => {
      if (data.account === null) {
        accountContainer.innerHTML = `<a href="/login" class="p-navigation__link" style="padding-right: 1rem;" tabindex="0" onclick="event.stopPropagation()">Sign in</a>`;
      } else {
        window.accountJSONRes = data.account;
        accountContainer.innerHTML = `<button href="#" class="p-navigation__link is-signed-in" aria-controls="canonical-login-content-mobile" aria-expanded="false" aria-haspopup="true">Account</button>
          <ul class="p-navigation__dropdown" id="canonical-login-content-mobile" aria-hidden="true">
            <li class="p-navigation__item--dropdown-close" id="canonical-login-back">
              <button class="p-navigation__link js-back" href="canonical-login-content-mobile" aria-controls="canonical-login-content-mobile" tabindex="-1"">
                Back
              </button>
            </li>
            <li class="p-navigation__account-name u-no-padding--bottom">
              <p class="p-text--small">Logged in as <br/>
              <strong>${data.account.email}</strong></p>
              <hr class="is-dark u-no-margin" />
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

// Add GA events

var origin = window.location.href;

addGANavEvents("#all-canonical-link", "www.ubuntu.com-nav-global");
addGANavEvents("#canonical-login", "www.ubuntu.com-nav-0-login");
addGANavEvents("#use-case", "www.ubuntu.com-nav-1-use-case");
addGANavEvents("#support", "www.ubuntu.com-nav-1-support");
addGANavEvents("#community", "www.ubuntu.com-nav-1-community");
addGANavEvents("#get-ubuntu", "www.ubuntu.com-nav-1-get-ubuntu");
addGANavEvents(".p-navigation.is-secondary", "www.ubuntu.com-nav-2");
addGANavEvents(".p-contextual-footer", "www.ubuntu.com-footer-contextual");
addGANavEvents(".p-footer__nav", "www.ubuntu.com-nav-footer-0");
addGANavEvents(".p-footer--secondary", "www.ubuntu.com-nav-footer-1");
addGANavEvents(".js-product-card", "www.ubuntu.com-product-card");

function addGANavEvents(target, category) {
  var t = document.querySelector(target);
  if (t) {
    [].slice.call(t.querySelectorAll("a")).forEach(function (a) {
      a.addEventListener("click", function (e) {
        dataLayer.push({
          event: "GAEvent",
          eventCategory: category,
          eventAction: "from:" + origin + " to:" + a.href,
          eventLabel: a.text,
          eventValue: undefined,
        });
      });
    });
  }
}

addGAContentEvents("#main-content");

function addGAContentEvents(target) {
  var t = document.querySelector(target);
  if (t) {
    [].slice.call(t.querySelectorAll("a")).forEach(function (a) {
      let category;
      if (a.classList.contains("p-button--positive")) {
        category = "www.ubuntu.com-content-cta-0";
      } else if (a.classList.contains("p-button")) {
        category = "www.ubuntu.com-content-cta-1";
      } else {
        category = "www.ubuntu.com-content-link";
      }
      if (!a.href.startsWith("#")) {
        a.addEventListener("click", function () {
          dataLayer.push({
            event: "GAEvent",
            eventCategory: category,
            eventAction: "from:" + origin + " to:" + a.href,
            eventLabel: a.text,
            eventValue: undefined,
          });
        });
      }
    });
  }
}

addGAImpressionEvents(".js-product-card", "product-card");

function addGAImpressionEvents(target, category) {
  var t = [].slice.call(document.querySelectorAll(target));
  if (t) {
    t.forEach(function (section) {
      if (!section.classList.contains("u-hide")) {
        var a = section.querySelector("a");
        dataLayer.push({
          event: "NonInteractiveGAEvent",
          eventCategory: "www.ubuntu.com-impression-" + category,
          eventAction: "from:" + origin + " to:" + a.href,
          eventLabel: a.text,
          eventValue: undefined,
        });
      }
    });
  }
}

addGADownloadImpressionEvents(".js-download-option", "download-option");

function addGADownloadImpressionEvents(target, category) {
  var t = [].slice.call(document.querySelectorAll(target));
  if (t) {
    t.forEach(function (section) {
      dataLayer.push({
        event: "NonInteractiveGAEvent",
        eventCategory: "www.ubuntu.com-impression-" + category,
        eventAction: "Display option",
        eventLabel: section.innerText,
        eventValue: undefined,
      });
    });
  }
}

addUTMToForms();

function addUTMToForms() {
  var params = new URLSearchParams(window.location.search);
  const utm_names = ["campaign", "source", "medium"];
  for (let i = 0; i < utm_names.length; i++) {
    var utm_fields = document.getElementsByName("utm_" + utm_names[i]);
    for (let j = 0; j < utm_fields.length; j++) {
      if (utm_fields[j]) {
        utm_fields[j].value = params.get("utm_" + utm_names[i]);
      }
    }
  }
}
