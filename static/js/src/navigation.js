const ANIMATION_DELAY = 200;

const dropdownWindow = document.querySelector(".dropdown-window");
const dropdownWindowOverlay = document.querySelector(".dropdown-window-overlay");
const secondaryNav = document.querySelector(".p-navigation.is-secondary");
const navigation = document.querySelector(".p-navigation--sliding");
const topLevelNavDropdowns = Array.from(document.querySelectorAll(
  ".p-navigation__item--dropdown-toggle:not(.global-nav__dropdown-toggle):not(.js-back)"
));
const nav = navigation.querySelector(".js-show-nav");
const menuButtons = document.querySelectorAll(".js-menu-button");

// Update mobile view
function updateMobileView() {
  if (window.innerWidth <= 1150) {
    topLevelNavDropdowns.forEach((dropdown) => {
      if (dropdown.classList.contains("is-active")) {
        navigation.classList.add("has-menu-open");
      }
    });
  }
}

// Initialize mobile view
window.addEventListener("load", updateMobileView);
window.addEventListener("resize", updateMobileView);

// Event Listener for dropdown clicks
topLevelNavDropdowns.forEach((dropdown, index) => {
  dropdown.addEventListener("click", (event) => {
    event.preventDefault();
    handleDropdownClick(dropdown);
  });
});

// Handle overlay click
dropdownWindowOverlay?.addEventListener("click", () => {
  if (dropdownWindow.classList.contains("is-active")) {
    closeAll();
  }
});

// Handle secondary nav click
secondaryNav
  ?.querySelector(".p-navigation__toggle--open")
  ?.addEventListener("click", toggleSecondaryMobileNavDropdown);

// Event Listener for global-nav-opened
document.addEventListener("global-nav-opened", () => {
  addClassesToElements(
    [dropdownWindow, dropdownWindowOverlay],
    ["slide-animation", "fade-animation"]
  );
  topLevelNavDropdowns.forEach((dropdown) => updateDropdownStates(dropdown, false));
});

// Toggles secondary mobile dropdown
function toggleSecondaryMobileNavDropdown(event) {
  event.preventDefault();
  const mobileNavDropdown = secondaryNav.querySelector(".p-navigation__nav");
  const isDropdownOpen = mobileNavDropdown.classList.contains("is-open");
  mobileNavDropdown.classList.toggle("is-open", !isDropdownOpen);
  this.classList.toggle("is-open", !isDropdownOpen);
}

function handleDropdownClick(clickedDropdown) {
  const isActive = clickedDropdown.classList.contains('is-active');
  updateNavMenu(clickedDropdown, !isActive);
  setTabindex(clickedDropdown.querySelector('ul.p-navigation__dropdown'));
}

function updateNavMenu(dropdown, show) {
  let dropdownContent = document.getElementById(dropdown.id + '-content');
  let dropdownContentMobile = document.getElementById(dropdown.id + '-content-mobile');

  if (dropdownContent && dropdownContentMobile) {
    if (!show) updateDropdownStates(dropdown, show, ANIMATION_DELAY);
    else updateDropdownStates(dropdown, show);
    toggleDropdownWindowAnimation(show);
  }
}

function updateDropdownStates(dropdown, show, delay) {
  let isNested = dropdown.parentNode.classList.contains('p-navigation__dropdown');
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
  let dropdownContent = document.getElementById(dropdown.dataset.id + '-content');
  toggleActiveState(dropdown, show);
  toggleDropdownContentVisibility(dropdownContent, show, delay);
}

function updateMobileDropdownState(dropdown, show, isNested = false) {
  let dropdownContentMobile = document.getElementById(dropdown.dataset.id + '-content-mobile');
  if (dropdownContentMobile) {
    dropdownContentMobile.setAttribute('aria-hidden', !show);
    if (!isNested) {
      toggleActiveState(dropdownContentMobile.parentNode.parentNode, show);
    }
  }
}

function toggleActiveState(element, active) {
  element.classList.toggle('is-active', active);
}

function toggleDropdownContentVisibility(contentElement, show, delay = 0) {
  if (delay > 0 && !show) {
    setTimeout(() => contentElement.classList.toggle('u-hide', !show), delay);
  } else {
    contentElement.classList.toggle('u-hide', !show);
  }
}

function toggleDropdownWindowAnimation(show) {
  dropdownWindow.classList.toggle('slide-animation', !show);
  dropdownWindowOverlay.classList.toggle('fade-animation', !show);
  toggleActiveState(dropdownWindow, show);
}

function addClassesToElements(elements, classes) {
  elements.forEach((element, index) => element.classList.add(classes[index]));
}

function removeClassesFromElements(elements, classes) {
  elements.forEach((element, index) =>
    element.classList.remove(classes[index])
  );
}

function closeDropdown(dropdown) {
  toggleActiveState(dropdown, false);
  toggleDropdownWindowAnimation(false);
  if (window.history.pushState) {
    window.history.pushState(null, null, window.location.href.split("#")[0]);
  }
}

const currentBubble = window.location.pathname.split("/")[1];
const skipLink = document.querySelector(".p-link--skip");
const reducedNav = document.querySelector(".p-navigation--sliding.is-reduced ");
let dropdowns = [];
const mainList = document.querySelector(
  "nav.p-navigation__nav > .p-navigation__items"
);

function getAllElements(queryString) {
  const lists = [...dropdowns, mainList];
  let listItems = [];
  lists.forEach(function (list) {
    const items = list.querySelectorAll(queryString);
    listItems = [...items, ...listItems];
  });
  return listItems;
}

nav.classList.remove("u-hide");

checkTopNav();

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

// if the user has previously visited a page in the same bubble,
// and scrolled up to reveal the reduced nav, show the nav on
// pages within the same bubble
function checkTopNav() {
  const lastBubble = sessionStorage.getItem("navBubble");

  if (lastBubble === currentBubble) {
    document.body.classList.add("navigation-lock");
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

function createTempElement(responseText, selector) {
  const tempElement = document.createElement("div");
  tempElement.innerHTML = responseText;
  return tempElement.querySelector(selector);
}

function attachBackButtonEventListener(element) {
  element.addEventListener("click", function(e) {
    goBackOneLevel(e, element);
  });
}

function deactivateActiveCTA(element) {
  toggleActiveState(element, false);
}

function fetchDropdown(event, url, id) {
  const triggerEl = event.target;
  const container = document.getElementById(id);
  const mobileContainer = triggerEl.parentNode;

  if (container.innerHTML === "") {
    makeRequest(url, function() {
      const desktopContent = createTempElement(this.responseText, ".desktop-dropdown-content");
      container.appendChild(desktopContent);

      const mobileContent = createTempElement(this.responseText, ".dropdown-content-mobile");
      mobileContainer.appendChild(mobileContent);

      const targetDropdowns = mobileContent.querySelectorAll("ul.p-navigation__dropdown");
      dropdowns = [...dropdowns, ...targetDropdowns];

      const jsBackButtons = mobileContainer.querySelectorAll(".js-back");
      jsBackButtons.forEach(attachBackButtonEventListener);

      const activeCTAs = mobileContainer.querySelectorAll("a.is-active");
      activeCTAs.forEach(deactivateActiveCTA);

      const newToggles = mobileContainer.querySelectorAll("li.p-navigation__item--dropdown-toggle");
      newToggles.forEach(toggle => toggle.addEventListener("click", function(e) {
        console.log("Event should be firing on click");
      }));
    });
  }
}

const goBackOneLevel = (e, backButton) => {
  e.preventDefault();
  const target = backButton.parentNode.parentNode;
  target.setAttribute("aria-hidden", true);
  toggleActiveState(backButton.closest(".is-active"), false);
  toggleActiveState(backButton.closest(".is-active"), false);
  setTabindex(target.parentNode.parentNode);

  if (target.parentNode.getAttribute("role") == "menuitem") {
    updateNavMenu(target.parentNode, false);
  }
};

const setTabindex = (target) => {
  const lists = [...dropdowns, mainList];
  lists.forEach(function (list) {
    const elements = list.querySelectorAll("ul > li > a, ul > li > button");
    elements.forEach(function (element) {
      element.setAttribute("tabindex", "-1");
    });
  });
  target.querySelectorAll("li").forEach(function (element) {
    if (element.parentNode === target) {
      element.children[0].setAttribute("tabindex", "0");
    }
  });
};

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

  navigation.classList.remove("has-menu-open");

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
  dropdownElements.forEach(function (dropdown) {
    if (dropdown.classList.contains("is-active")) {
      toggleActiveState(dropdown, false);
      dropdown
        .querySelector("ul.p-navigation__dropdown")
        .setAttribute("aria-hidden", true);
    }
  });
}

function closeAll() {
  closeSearch();
  closeNav();
  setTabindex(mainList);
}

function keyPressHandler(e) {
  if (e.key === "Escape") {
    closeAll();
  }
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

//
//Setup and functions for navigaiton search
//
function initNavigationSearch() {
  searchButtons.forEach((searchButton) => {
    searchButton.addEventListener("click", toggleSearch);
  });

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
  const searchInput = navigation.closest(".p-search-box__input");

  Array.from(searchButtons).forEach((searchButton) => {
    searchButton.setAttribute("aria-pressed", true);
  });

  navigation.classList.add("has-search-open");
  if (secondaryNav) {
    secondaryNav.classList.add("u-hide");
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

function toggleSection(e) {
  e.preventDefault();

  const target = e.target.getAttribute("aria-controls");
  const el = document.querySelector(`.dropdown-content-desktop #${target}`);

  el.removeAttribute("hidden");

  setTimeout(function () {
    toggleActiveState(el, true);
    el.focus();
  }, 1);
}

// Init login

var accountContainer = document.querySelector(".js-account");
if (accountContainer) {
  fetch("/account.json")
    .then((response) => response.json())
    .then((data) => {
      if (data.account === null) {
        accountContainer.innerHTML = `<a href="/login" class="p-navigation__link" style="padding-right: 1rem;"><i class="p-icon--user is-light">Sign in</i></a>`;
      } else {
        window.accountJSONRes = data.account;
        accountContainer.innerHTML = `<div class="p-navigation__item--dropdown-toggle">
            <a href="#" class="p-navigation__link" aria-controls="user-menu" aria-expanded="false" aria-haspopup="true"><i class="p-icon--user is-light">${data.account.fullname}</i></a>
            <ul class="p-navigation__dropdown--right" id="user-menu" aria-hidden="true">
              <li><a href="/pro/dashboard" class="p-navigation__dropdown-item">Ubuntu Pro dashboard</a></li>
              <li>
                <hr class="u-no-margin--bottom">
                <a href="/account/invoices" class="p-navigation__dropdown-item">Invoices & Payments</a>
              </li>
              <li>
                <a href="https://login.ubuntu.com/" class="p-navigation__dropdown-item">Account settings</a>
              </li>
              <li>
                <a href="/logout" class="p-navigation__dropdown-item">Logout</a>
              </li>
            </ul>
          </div>`;
      }

      function toggleMenu(element, show) {
        const container = element.closest(
          ".p-navigation__item--dropdown-toggle"
        );
        var target = document.getElementById(
          element.getAttribute("aria-controls")
        );

        if (show) {
          toggleActiveState(container, true);
          [].slice.call(dropdownWindow.children).forEach((dropdownContent) => {
            dropdownContent.classList.add("u-hide");
          });
        } else {
          toggleActiveState(container, false);
        }

        if (target) {
          element.setAttribute("aria-expanded", show);
          target.setAttribute("aria-hidden", !show);

          if (show) {
            target.focus();
            topLevelNavDropdowns.forEach(function (dropdown) {
              closeDropdown(dropdown);
            });
          }
        }
      }

      /**
        Attaches event listeners for the menu toggle open and close click events.
        @param {HTMLElement} menuToggle The menu container element.
      */
      function setupContextualMenu(menuToggle) {
        menuToggle.addEventListener("click", function (event) {
          event.preventDefault();

          var menuAlreadyOpen =
            menuToggle.getAttribute("aria-expanded") === "true";

          var top = menuToggle.offsetHeight;
          // for inline elements leave some space between text and menu
          if (window.getComputedStyle(menuToggle).display === "inline") {
            top += 5;
          }

          toggleMenu(menuToggle, !menuAlreadyOpen, top);
        });
      }

      /**
        Attaches event listeners for all the menu toggles in the document and
        listeners to handle close when clicking outside the menu or using ESC key.
        @param {String} contextualMenuToggleSelector The CSS selector matching menu toggle elements.
      */
      function setupAllContextualMenus(contextualMenuToggleSelector) {
        // Setup all menu toggles on the page.
        var userToggle = document.querySelector(contextualMenuToggleSelector);
        if (userToggle) {
          setupContextualMenu(userToggle);

          // Add handler for clicking outside the menu.
          document.addEventListener("click", function (event) {
            var contextualMenu = document.getElementById(
              userToggle.getAttribute("aria-controls")
            );
            var clickOutside = !(
              userToggle.contains(event.target) ||
              contextualMenu.contains(event.target)
            );

            if (clickOutside) {
              toggleMenu(userToggle, false);
            }
          });
        }
      }

      setupAllContextualMenus(
        ".p-navigation__user .p-navigation__item--dropdown-toggle .p-navigation__link"
      );
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
