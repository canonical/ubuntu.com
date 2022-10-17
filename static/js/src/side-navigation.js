/**
 * Select all Side Navigation components: ".p-side-navigation" "[class*='p-side-navigation--']"
 *  - Collapse/Expand side navigation using button ".js-drawer-toggle"
 *  - Handle active state of links ".p-side-navigation__link"
 *  - Handle Collapse/Expand for submenus of side navigation ".p-side-navigation__expand"
 */

/**
 Toggles the expanded/collapsed classed on side navigation element.

 @param {HTMLElement} sideNavigation The side navigation element.
 @param {Boolean} show Whether to show or hide the drawer.
 @param {Boolean} ignoreTogglerFocus when we click on menu there is no redirect, the focus should jump into selected section
 */
function toggleDrawer(sideNavigation, show, ignoreTogglerFocus = false) {
  const toggleButtonOutsideDrawer = sideNavigation.querySelector(
    ".p-side-navigation__toggle"
  );
  const toggleButtonInsideDrawer = sideNavigation.querySelector(
    ".p-side-navigation__toggle--in-drawer"
  );

  if (sideNavigation) {
    if (show) {
      sideNavigation.classList.remove("is-collapsed");
      sideNavigation.classList.add("is-expanded");

      if (!ignoreTogglerFocus) {
        toggleButtonInsideDrawer.focus();
      }
      toggleButtonOutsideDrawer.setAttribute("aria-expanded", "true");
      toggleButtonInsideDrawer.setAttribute("aria-expanded", "true");
    } else {
      sideNavigation.classList.remove("is-expanded");
      sideNavigation.classList.add("is-collapsed");

      if (!ignoreTogglerFocus) {
        toggleButtonOutsideDrawer.focus();
      }
      toggleButtonOutsideDrawer.setAttribute("aria-expanded", "false");
      toggleButtonInsideDrawer.setAttribute("aria-expanded", "false");
    }
  }
}

/**
 Setup default values of aria-expanded for the toggle button, list title and list itself

 @param {HTMLButtonElement} toggleMenu
 */
const setupToggleMenu = (toggleMenu) => {
  const isExpanded = toggleMenu.getAttribute("aria-expanded") === "true";
  if (!isExpanded) {
    toggleMenu.setAttribute("aria-expanded", isExpanded);
  }
  const item = toggleMenu.closest(".p-side-navigation__item");
  const link = item.querySelector(".p-side-navigation__link");
  const nestedList = item.querySelector(".p-side-navigation__list");
  if (!link?.hasAttribute("aria-expanded")) {
    link.setAttribute("aria-expanded", isExpanded);
  }
  if (!nestedList?.hasAttribute("aria-expanded")) {
    nestedList.setAttribute("aria-expanded", isExpanded);
  }
};

/**
 Handle toggle button to show/hide submenu

 @param {Event} e
 */
const handleToggleMenu = (e) => {
  const item = e.currentTarget.closest(".p-side-navigation__item");
  const button = item.querySelector(".p-side-navigation__expand");
  const link = item.querySelector(".p-side-navigation__link");
  const nestedList = item.querySelector(".p-side-navigation__list");
  [button, link, nestedList].forEach((el) =>
    el.setAttribute(
      "aria-expanded",
      el.getAttribute("aria-expanded") === "true" ? "false" : "true"
    )
  );
};

/**
 Attaches event listeners for the side navigation and submenu toggles

 @param {HTMLElement} sideNavigation The side navigation element.
 */
function setupSideNavigation(sideNavigation) {
  const toggles = [...sideNavigation.querySelectorAll(".js-drawer-toggle")];

  // setup toggle buttons for sidenav
  toggles.forEach(function (toggle) {
    toggle.addEventListener("click", function (event) {
      event.preventDefault();
      toggleDrawer(
        sideNavigation,
        !sideNavigation.classList.contains("is-expanded")
      );
    });
  });

  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      toggleDrawer(sideNavigation, false);
    }
  });

  // Setup expandable submenus side navigation
  const expandMenuToggles = [
    ...sideNavigation.querySelectorAll(".p-side-navigation__expand"),
  ];
  expandMenuToggles.forEach((toggleMenu) => {
    setupToggleMenu(toggleMenu);
    toggleMenu.addEventListener("click", (e) => {
      handleToggleMenu(e);
    });
  });

  // SETUP menu links click when expand/collapse side nav is not available
  if (expandMenuToggles.length === 0) {
    const currentHash = window.location.hash;
    const currentPath = window.location.pathname;
    const currentUrl = currentPath + currentHash;
    const links = [
      ...sideNavigation.querySelectorAll(".p-side-navigation__link"),
    ];
    links.forEach(function (link) {
      link.addEventListener("click", function () {
        links.forEach(function (link) {
          link.removeAttribute("aria-current");
        });
        this.setAttribute("aria-current", "page");
        this.blur();
        const isExpanded = sideNavigation.classList.contains("is-expanded");
        if (isExpanded) {
          toggleDrawer(sideNavigation, !isExpanded, true);
        }
      });

      const linkUrl = link.getAttribute("href");
      if (linkUrl === currentUrl || linkUrl === currentHash) {
        link.setAttribute("aria-current", "page");
      }
    });
  }
}

/**
 Attaches event listeners for all the side navigations in the document.
 @param {String} sideNavigationSelector The CSS selector matching side navigation elements.
 */
function setupSideNavigations(sideNavigationSelector) {
  // Setup all side navigations on the page.
  const sideNavigations = [
    ...document.querySelectorAll(sideNavigationSelector),
  ];
  sideNavigations.forEach(setupSideNavigation);
}

setupSideNavigations(".p-side-navigation, [class*='p-side-navigation--']");
