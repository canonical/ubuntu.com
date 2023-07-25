const ANIMATION_DELAY = 200;
const MOBILE_VIEW_BREAKPOINT = 1250;
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
console.log("topLevelNaDropdowns",topLevelNavDropdowns)
const nav = navigation.querySelector(".js-show-nav");
const menuButtons = document.querySelectorAll(".js-menu-button");
const skipLink = document.querySelector(".p-link--skip");
const jsBackbuttons = document.querySelectorAll(".js-back");
const reducedNav = document.querySelector(".p-navigation--sliding.is-reduced ");
let dropdowns = [];
const mainList = document.querySelector(
  "nav.p-navigation__nav > .p-navigation__items"
);
const currentBubble = window.location.pathname.split("/")[1];

nav.classList.remove("u-hide");

// if the user has previously visited a page in the same bubble,
// and scrolled up to reveal the reduced nav, show the nav on
// pages within the same bubble
function checkTopNav() {
  const lastBubble = sessionStorage.getItem("navBubble");

  if (lastBubble === currentBubble) {
    addClassesToElements([document.body], ["navigation-lock"]);
  }
}
checkTopNav();

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
window.addEventListener("load", updateMobileView);
window.addEventListener("resize", updateMobileView);

topLevelNavDropdowns.forEach((dropdown) => {
  dropdown.addEventListener("click", (event) => {
    event.preventDefault();
    event.stopPropagation();
    handleDropdownClick(dropdown);
  });
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

document.addEventListener("wheel", function (e) {
  if (window.scrollY <= 0) {
    revealTopNav();
  }
});

document.addEventListener("scroll", function (e) {
  if (window.scrollY <= 0) {
    revealTopNav();
  }
});

if (skipLink) {
  skipLink.addEventListener("focus", function (e) {
    if (window.scrollY <= 0) {
      revealTopNav();
    }
  });
}

if (reducedNav) {
  reducedNav.addEventListener("focus", function (e) {
    if (window.scrollY <= 0) {
      revealTopNav();
    }
  });
}

// Event handler functions

function updateMobileView() {
  if (window.innerWidth <= MOBILE_VIEW_BREAKPOINT) {
    topLevelNavDropdowns.forEach((dropdown) => {
      if (dropdown.classList.contains("is-active")) {
        addClassesToElements([navigation], ["has-menu-open"]);
      }
    });
  } else if (window.innerWidth >= MOBILE_VIEW_BREAKPOINT) {
    if (secondaryNav) {
      secondaryNav
        .querySelector(".p-navigation__nav")
        ?.classList.remove("is-open");
    }
  }
}

function toggleSecondaryMobileNavDropdown(event) {
  event.preventDefault();
  const mobileNavDropdown = secondaryNav.querySelector(".p-navigation__nav");
  const isDropdownOpen = mobileNavDropdown.classList.contains("is-open");
  mobileNavDropdown.classList.toggle("is-open", !isDropdownOpen);
  this.classList.toggle("is-open", !isDropdownOpen);
}

function handleDropdownClick(clickedDropdown) {
  console.log("handleDropdownClick, ", clickedDropdown)
  const isActive = clickedDropdown.classList.contains("is-active");
  updateNavMenu(clickedDropdown, !isActive);
  setTabindex(clickedDropdown.querySelector("ul.p-navigation__dropdown"));
}

function goBackOneLevel(e, backButton) {
  console.log("backButton", backButton)
  e.preventDefault();
  const target = backButton.parentNode.parentNode;
  console.log(target)
  target.setAttribute("aria-hidden", true);
  toggleIsActiveState(backButton.closest(".is-active"), false);
  toggleIsActiveState(backButton.closest(".is-active"), false);
  setTabindex(target.parentNode.parentNode);

  if (target.parentNode.getAttribute("role") == "menuitem") {
    updateNavMenu(target.parentNode, false);
  }
}

function keyPressHandler(e) {
  if (e.key === "Escape") {
    closeAll();
  }
}

// Attaches to tab items in desktop dropdown and updates them,
// also applies the same update to the mobile dropdown.
// Is attached via HTML onclick attribute.
function toggleSection(e) {
  e.preventDefault();

  const target = e.target.getAttribute("aria-controls");
  const el = document.querySelector(`.dropdown-content-desktop #${target}`);
  el.removeAttribute("hidden");

  setTimeout(function () {
    toggleIsActiveState(el, true);
    el.focus();
  }, 1);
}

/**
  Function to update the state of mobile and desktop dropdowns
  @param {HTMLNode} dropdown <li class="p-navigation__item--dropdown-toggle">
*/
function updateNavMenu(dropdown, show) {
  console.log("in updateNavMenu", dropdown)
  let dropdownContent = document.getElementById(dropdown.id + "-content");
  let dropdownContentMobile = document.getElementById(
    dropdown.id + "-content-mobile"
  );
  let isAccountDropdown = dropdown.classList.contains("js-account");
  console.log(dropdown.id)
  updateAccountDropdown(dropdown, isAccountDropdown);

  console.log(dropdownContentMobile, dropdownContent)
  if ((dropdownContent && dropdownContentMobile) || isAccountDropdown) {
    console.log("updateNavMenu first if")
    if (!show) updateDropdownStates(dropdown, show, ANIMATION_DELAY);
    else updateDropdownStates(dropdown, show);
    if (isAccountDropdown) show = false;
    toggleDropdownWindowAnimation(show);
  } else if (dropdownContentMobile) {
    console.log("updateNavMenu second if")

    updateMobileDropdownState(dropdown, show);
  }
}

function updateDropdownStates(dropdown, show, delay) {
  console.log("updateDropdownStates", dropdown, show)
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
}

function updateDesktopDropdownStates(dropdown, show, delay) {
  console.log(dropdown.id, show)
  let dropdownContent = document.getElementById(
    dropdown.dataset.id + "-content"
  );
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
    dropdown.dataset.id + "-content-mobile"
  );
  if (dropdownContentMobile) {
    dropdownContentMobile.setAttribute("aria-hidden", !show);
    toggleIsActiveState(dropdownContentMobile.parentNode.parentNode, show);
    toggleIsActiveState(dropdownContentMobile.parentNode, show);
  }
}

let currentDropdownHandler = null;
function updateAccountDropdown(dropdown, isTarget) {
  if (isTarget && !dropdown.classList.contains("is-active")) {
    currentDropdownHandler = createDropdownHandler(dropdown);
    document.addEventListener("click", currentDropdownHandler);
  } else {
    if (currentDropdownHandler) {
      document.removeEventListener("click", currentDropdownHandler);
      accountContainer.classList.remove("is-active");
      currentDropdownHandler = null;
    }
  }
}

function createDropdownHandler(dropdown) {
  return function (e) {
    e.stopPropagation();
    handleClickOutsideDropdown(e.target, dropdown);
  };
}

function handleClickOutsideDropdown(clickTarget, dropdown) {
  if (!dropdown.contains(clickTarget)) {
    handleDropdownClick(dropdown, false);
    if (currentDropdownHandler) {
      document.removeEventListener("click", currentDropdownHandler);
      currentDropdownHandler = null;
    }
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

function toggleDropdownWindowAnimation(show) {
  dropdownWindow.classList.toggle("slide-animation", !show);
  dropdownWindowOverlay.classList.toggle("fade-animation", !show);
  toggleIsActiveState(dropdownWindow, show);
}

function toggleGlobalNavVisibility(dropdown, show, delay) {
  const globalNavContent = dropdown.querySelector(".global-nav-dropdown");
  const globalNavInnerContent = dropdown.querySelector(".global-nav-dropdown__content");
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

function revealTopNav() {
  document.body.style.marginTop = 0;
  sessionStorage.setItem("navBubble", currentBubble);
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

function attachBackButtonEventListener(element, secondaryFunction) {
  element.addEventListener(
    "click",
    function (e) {
      e.stopImmediatePropagation();
      goBackOneLevel(e, element);
      if (secondaryFunction) secondaryFunction();
    },
    true
  );
}

function deactivateActiveCTA(element) {
  toggleIsActiveState(element, false);
}

/**
  Fetches the contents of indervidual, top level, navigation items
  @param {String} url the path tp fetch the subsection
  @param {String} id the id of the target subsection
*/
let isFetching = false;
function fetchDropdown(url, id) {
  if (isFetching) return;
  isFetching = true;
  const container = document.getElementById(id + "-content");
  const mobileContainer = document.getElementById(id);

  if (container.innerHTML === "") {
    makeRequest(url, function () {
      const desktopContent = convertHTMLToNode(
        this.responseText,
        ".desktop-dropdown-content"
      );
      container.appendChild(desktopContent);

      const mobileContent = convertHTMLToNode(
        this.responseText,
        ".dropdown-content-mobile"
      );
      mobileContainer.appendChild(mobileContent);

      const targetDropdowns = mobileContent.querySelectorAll(
        "ul.p-navigation__dropdown"
      );
      dropdowns = [...dropdowns, ...targetDropdowns];

      const targetJsBackButtons = mobileContainer.querySelectorAll(".js-back");
      targetJsBackButtons.forEach(attachBackButtonEventListener);

      const activeCTAs = mobileContainer.querySelectorAll("a.is-active");
      activeCTAs.forEach(deactivateActiveCTA);

      const newToggles = mobileContainer.querySelectorAll(
        "li.p-navigation__item--dropdown-toggle"
      );
      newToggles.forEach((toggle) =>
        toggle.addEventListener("click", (e) => {
          e.stopImmediatePropagation();
          handleDropdownClick(toggle);
        })
      );
    });
  }
  isFetching = false;
}

/**
  Updates the tab index of the target group to 0
  @param {HTMLNode} target <ul class="p-navigation__items">
  or <ul class="p-navigation__dropdown">
*/
function setTabindex(target) {
  const lists = [...dropdowns, mainList];
  lists.forEach((list) => {
    const elements = list.querySelectorAll("ul > li > a, ul > li > button");
    elements.forEach(function (element) {
      element.setAttribute("tabindex", "-1");
    });
  });
  target.querySelectorAll("li").forEach((element) => {
    if (element.parentNode === target) {
      element.children[0].setAttribute("tabindex", "0");
    }
  });
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

  removeClassesFromElements(
    [navigation, mainList],
    ["has-menu-open", "is-active"]
  );
  deactivateMobileDropdownElements();
  deactivateDesktopDropdownElements();

  document.removeEventListener("keyup", keyPressHandler);
}

function deactivateDesktopDropdownElements() {
  toggleDropdownWindowAnimation(false);
  [].slice.call(dropdownWindow.children).forEach((dropdownContent) => {
    if (!dropdownContent.classList.contains("u-hide")) {
      dropdownContent.classList.add("u-hide");
    }
  });
}

function deactivateMobileDropdownElements(exception) {
  const dropdownElements = getAllElements(
    ".p-navigation__item--dropdown-toggle"
  );
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
  setTabindex(mainList);
}

function openMenu(e) {
  e.preventDefault();

  menuButtons.forEach((menuButton) => {
    menuButton.setAttribute("aria-pressed", true);
  });

  navigation.classList.add("has-menu-open");
  document.addEventListener("keyup", keyPressHandler);
  setTabindex(mainList);
}

// Setup and functions for navigaiton search
function initNavigationSearch() {
  searchButtons.forEach((searchButton) => {
    searchButton.addEventListener("click", toggleSearch);
  });

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
  document.addEventListener("keyup", keyPressHandler);
}

function closeSearch() {
  searchButtons.forEach((searchButton) => {
    searchButton.removeAttribute("aria-pressed");
  });

  navigation.classList.remove("has-search-open");

  if (secondaryNav) {
    secondaryNav.classList.remove("u-hide");
  }

  document.removeEventListener("keyup", keyPressHandler);
}

const searchButtons = document.querySelectorAll(".js-search-button");
const overlay = document.querySelector(".p-navigation__search-overlay");
initNavigationSearch();

// Setuo global-nav
function setUpGlobalNav() {
  const globalNavTab = document.querySelector(".global-nav-mobile");
  const globalNavMainTabs = globalNavTab.querySelector("ul.p-navigation__items");
  globalNavMainTabs.classList.remove("p-navigation__items");
  globalNavMainTabs.classList.add("p-navigation__dropdown", "dropdown-content-mobile");
  globalNavMainTabs.setAttribute("id", "all-canonical-content-mobile");
  const globalNavMobileDropdowns = globalNavTab.querySelectorAll(".p-navigation__dropdown");
  globalNavMobileDropdowns.forEach((dropdown) => {
    console.log(dropdown.id)
    const tempHTMLContainer = document.createElement('div');
    tempHTMLContainer.innerHTML = `<li class="p-navigation__item--dropdown-close" id="${dropdown.id}-back">
        <button class="p-navigation__link js-back" href="${dropdown.id}" aria-controls="${dropdown.id}" tabindex="-1" onclick="event.stopPropagation()">
          Back
        </button>
      </li>`;
    const backButton = tempHTMLContainer.firstChild.cloneNode(true);
    attachBackButtonEventListener(backButton.querySelector(".js-back"));
    dropdown.prepend(backButton);
    dropdown.addEventListener("click", (e) => {
      e.stopPropagation()
      handleDropdownClick(dropdown);
    });
    dropdown.setAttribute("aria-hidden", "true");
  })
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
        accountContainer.innerHTML = `<a href="/login" class="p-navigation__link" style="padding-right: 1rem;" tabindex="0" onclick="event.stopPropagation()">Sign-in<i class="p-icon--user is-light"></i></a>`;
      } else {
        window.accountJSONRes = data.account;
        accountContainer.innerHTML = `<button href="#" class="p-navigation__link is-signed-in" aria-controls="canonical-login-content-mobile" aria-expanded="false" aria-haspopup="true">Account&nbsp;<i class="p-icon--user is-light">${data.account.fullname}</i></button>
          <ul class="p-navigation__dropdown" id="canonical-login-content-mobile" aria-hidden="true">
            <li class="p-navigation__item--dropdown-close" id="canonical-login-back">
              <button class="p-navigation__link js-back" href="canonical-login-content-mobile" aria-controls="canonical-login-content-mobile" tabindex="-1" onclick="event.stopPropagation()">
                Back
              </button>
            </li>
            <li class="p-navigation__dropdown-item"><a class="p-link--inverted" href="/pro/dashboard" onclick="event.stopPropagation()">Ubuntu Pro dashboard</a></li>
            <li class="p-navigation__dropdown-item">
              <a class="p-link--inverted" href="/account/invoices onclick="event.stopPropagation()">Invoices & Payments</a>
            </li>
            <li class="p-navigation__dropdown-item">
              <a class="p-link--inverted" href="https://login.ubuntu.com/" onclick="event.stopPropagation()">Account settings</a>
            </li>
            <li class="p-navigation__dropdown-item">
              <a class="p-link--inverted" href="/logout" onclick="event.stopPropagation()">Logout</a>
            </li>
          </ul>`;

        const jsBackButton = accountContainer.querySelector(".js-back");
        attachBackButtonEventListener(jsBackButton, updateAccountDropdown);
      }
    });
}

// Add GA events

var origin = window.location.href;

addGANavEvents("#canonical-global-nav", "www.ubuntu.com-nav-global");
addGANavEvents("#canonical-login", "www.ubuntu.com-nav-0-login");
addGANavEvents("#enterprise-content", "www.ubuntu.com-nav-1-enterprise");
addGANavEvents("#developer-content", "www.ubuntu.com-nav-1-developer");
addGANavEvents("#community-content", "www.ubuntu.com-nav-1-community");
addGANavEvents("#get-ubuntun-content", "www.ubuntu.com-nav-1-get-ubuntu");
addGANavEvents(".p-navigation--secondary", "www.ubuntu.com-nav-2");
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

console.log("Mega nav built")