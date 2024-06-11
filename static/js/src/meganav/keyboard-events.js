import { closeAll } from "./meganav";

const navigation = document.querySelector(".p-navigation--sliding");
const mainList = document.querySelector(
  "nav.p-navigation__nav > .p-navigation__items"
);

export default function keyboardNavigationHandler(e) {
  if (e.key === "Escape") {
    handleEscapeKey(e);
  } else if (e.shiftKey && e.key === "Tab") {
    handleShiftTabKey(e);
  } else if (e.key === "Tab") {
    handleTabKey(e);
  }
}

function handleEscapeKey(e) {
  // If in the main nav, close all dropdowns
  if (
    e.target.closest(".p-navigation__items") ||
    e.target.classList.contains("p-search-box__input")
  ) {
    closeAll();
  }
  // If '.dropdown-window__sidenav-content' exists we are in the dropdown window so we want to move up to the side-tabs
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
  const desktopDropdownPanel = getDesktopContainingDropdown(e.target);
  const mobileDropdownPanel = getMobileContainingDropdown(e.target);
  if (mobileDropdownPanel && isLastMobileLinkFocused(e, mobileDropdownPanel)) {
    e.preventDefault();
    const canonicalLogo = navigation.querySelector(
      ".p-navigation__tagged-logo > a"
    );
    canonicalLogo.focus();
  } else if (
    desktopDropdownPanel &&
    isLastLinkFocused(e, desktopDropdownPanel)
  ) {
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
  const dropdownPanel = getDesktopContainingDropdown(e.target);
  const isFocused = isFirstLinkFocused(e, dropdownPanel);
  const hasTabPanel = tabPanelExists(e.target);
  const inTabPanel = isInTabPanel(e.target);

  if (isFocused && hasTabPanel && !inTabPanel) {
    const parentContainer = dropdownPanel.closest(".dropdown-window__content");
    const targetTab = parentContainer.querySelector(
      ".p-side-navigation__item .p-side-navigation__link.is-active"
    );
    if (targetTab) {
      e.preventDefault();
      targetTab?.focus();
    }
  } else if (isFocused && (inTabPanel || !hasTabPanel)) {
    const currrentActiveTab = mainList.querySelector(
      ":scope > .p-navigation__item--dropdown-toggle.is-active > a"
    );
    closeAll();
    e.preventDefault();
    currrentActiveTab?.focus();
  }
}

function isLastLinkFocused(e, dropdownPanel) {
  const listOfLinks = dropdownPanel?.querySelectorAll("a");
  if (listOfLinks?.length > 0) {
    const lastLink = Array.from(listOfLinks).pop();
    return e.target === lastLink;
  }
}

/**
 * Checks if the event target is the last mobile link focused in a mobile dropdown list.
 * @param {Event} e
 * @param {HTMLElement} dropdownList - The dropdown list containing navigation links.
 * @returns {boolean} - True if the target is the last link in the dropdown, false otherwise.
 */
function isLastMobileLinkFocused(e, dropdownList) {
  // Helper function to get the last link in a list of menu items
  function getLastLink(selector) {
    const items = dropdownList?.querySelectorAll(selector);
    if (items?.length > 0) {
      const lastItem = Array.from(items).pop();
      return lastItem.firstElementChild;
    }
    return null;
  }

  // Check if the target is the last link in the top-level menu
  const topLevelSelector = "li[role='menuitem']";
  const lastTopLevelLink = getLastLink(topLevelSelector);
  if (lastTopLevelLink) {
    return e.target === lastTopLevelLink;
  }

  // Check if the target is the last link in a dropdown list
  const dropdownListSelector =
    ":scope > li, :scope > li > ul.p-navigation__secondary-links > li";
  const lastDropdownListLink = getLastLink(dropdownListSelector);
  return e.target === lastDropdownListLink;
}

function isFirstLinkFocused(e, dropdownPanel) {
  const listOfLinks = dropdownPanel?.querySelectorAll("a");
  if (listOfLinks?.length > 0) {
    const firstLink = Array.from(listOfLinks).shift();
    return e.target === firstLink;
  }
}

function getDesktopContainingDropdown(target) {
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
