/* Custom implementation for contextual menu on /engage.
 * https://vanillaframework.io/docs/patterns/contextual-menu
 */

import { debounce } from "./utils/debounce.js";

const QUERY_KEYS = {
  language: "language",
  resource: "resource",
  tag: "tag",
  page: "page",
};

const SELECTORS = {
  menuToggle: ".p-engage-menu__toggle",
  menuLink: ".p-contextual-menu__link",
  tagToggle: ".p-engage-menu__toggle--tags",
  tagCheckbox: ".p-engage-menu__checkbox",
  checkedTagCheckbox: ".p-engage-menu__checkbox:checked",
  tagSelectAll: ".js-engage-tag-select-all",
  tagClear: ".js-engage-tag-clear",
  tagLabelText: ".p-engage-menu__label-text",
  tagCount: ".p-engage-menu__count",
};

const TAG_SUBMIT_DEBOUNCE_MS = 3000;

const SINGLE_SELECT_PARAMS = [QUERY_KEYS.language, QUERY_KEYS.resource];

function menuIdFor(paramKey) {
  return `engage-${paramKey}-menu`;
}

(function initEngageFilters() {
  const jsFilters = document.getElementById("js-engage-filters");
  if (jsFilters) {
    jsFilters.classList.remove("u-hide");
  }

  const tagMenu = document.getElementById(menuIdFor(QUERY_KEYS.tag));
  const tagToggle = document.querySelector(SELECTORS.tagToggle);

  function closeAllMenus() {
    document.querySelectorAll(SELECTORS.menuToggle).forEach((toggle) => {
      toggle.setAttribute("aria-expanded", "false");
      const menu = document.getElementById(
        toggle.getAttribute("aria-controls"),
      );
      if (menu) {
        menu.setAttribute("aria-hidden", "true");
      }
    });
  }

  function toggleMenu(toggle, menuId, isOpen) {
    if (isOpen) {
      closeAllMenus();
    } else {
      toggle.setAttribute("aria-expanded", "true");
      const menu = document.getElementById(menuId);
      if (menu) {
        menu.setAttribute("aria-hidden", "false");
      }
    }
  }

  // Set the dropdown toggle label as the current selection
  function setToggleLabel(toggle, text) {
    const label = toggle.querySelector("span");
    if (label) {
      label.textContent = text;
    }
    toggle.classList.add("is-active");
  }

  function navigateWithFilters(
    singleValueUpdates = {},
    multiValueKey = null,
    multiValues = [],
  ) {
    const nextUrl = new URL(window.location);

    Object.keys(singleValueUpdates).forEach((key) => {
      const value = singleValueUpdates[key];
      if (value === null) {
        nextUrl.searchParams.delete(key);
      } else {
        nextUrl.searchParams.set(key, value);
      }
    });

    if (multiValueKey) {
      nextUrl.searchParams.delete(multiValueKey);
      multiValues.forEach((value) => {
        nextUrl.searchParams.append(multiValueKey, value);
      });
    }

    nextUrl.searchParams.delete(QUERY_KEYS.page);
    window.location = nextUrl.href;
  }

  function restoreSingleSelectMenu(paramKey) {
    const value = new URL(window.location).searchParams.get(paramKey);
    if (!value) {
      return;
    }

    const menuId = menuIdFor(paramKey);
    const toggle = document.querySelector(`[aria-controls="${menuId}"]`);
    const dropdown = document.getElementById(menuId);
    if (!toggle || !dropdown) {
      return;
    }

    const option = dropdown.querySelector(`[data-value="${value}"]`);
    if (!option) {
      return;
    }

    setToggleLabel(toggle, option.textContent);
  }

  function updateTagsVisualState() {
    if (!tagMenu || !tagToggle) {
      return;
    }

    tagMenu.querySelectorAll(SELECTORS.tagCheckbox).forEach((checkbox) => {
      const label = checkbox.nextElementSibling;
      if (label && label.classList.contains("p-checkbox__label")) {
        const labelText = label.querySelector(SELECTORS.tagLabelText);
        if (labelText) {
          labelText.classList.toggle("p-heading--5", checkbox.checked);
        }
      }
    });

    const checkedTags = tagMenu.querySelectorAll(SELECTORS.checkedTagCheckbox);
    const tagCount = tagToggle.querySelector(SELECTORS.tagCount);
    if (tagCount) {
      tagCount.textContent = String(checkedTags.length);
      tagCount.style.display = checkedTags.length === 0 ? "none" : "";
    }
    tagToggle.classList.toggle("is-active", checkedTags.length > 0);
  }

  function restoreTagSelectionsFromUrlParams() {
    if (!tagMenu) {
      return;
    }

    const selectedTags = new URL(window.location).searchParams.getAll(
      QUERY_KEYS.tag,
    );
    const selectedTagSet = new Set(selectedTags);
    if (!selectedTags.length) {
      return;
    }

    tagMenu.querySelectorAll(SELECTORS.tagCheckbox).forEach((checkbox) => {
      checkbox.checked = selectedTagSet.has(checkbox.value);
    });
  }

  function restoreFilterState() {
    SINGLE_SELECT_PARAMS.forEach(restoreSingleSelectMenu);
    restoreTagSelectionsFromUrlParams();
    updateTagsVisualState();
  }

  function initSingleSelectMenus() {
    SINGLE_SELECT_PARAMS.forEach((paramKey) => {
      const menuId = menuIdFor(paramKey);
      const toggle = document.querySelector(`[aria-controls="${menuId}"]`);
      const dropdown = document.getElementById(menuId);
      if (!toggle || !dropdown) {
        return;
      }

      toggle.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        const isOpen = toggle.getAttribute("aria-expanded") === "true";
        toggleMenu(toggle, menuId, isOpen);
      });

      dropdown.querySelectorAll(SELECTORS.menuLink).forEach((optionLink) => {
        optionLink.addEventListener("click", () => {
          setToggleLabel(toggle, optionLink.textContent);
          toggle.setAttribute("aria-expanded", "false");
          dropdown.setAttribute("aria-hidden", "true");

          const paramValue = optionLink.getAttribute("data-value");
          const updates = {
            [paramKey]: paramValue === "all" ? null : paramValue,
          };
          navigateWithFilters(updates);
        });
      });
    });
  }

  function setupTagMenuToggle() {
    if (!tagToggle) {
      return;
    }

    tagToggle.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      const isOpen = tagToggle.getAttribute("aria-expanded") === "true";
      toggleMenu(tagToggle, menuIdFor(QUERY_KEYS.tag), isOpen);
    });
  }

  // Prevents `closeAllMenus()` from firing when selecting individual tags
  function setupTagMenuStopPropagation() {
    if (!tagMenu) {
      return;
    }

    tagMenu.addEventListener("click", (e) => {
      e.stopPropagation();
    });
  }

  function setAllTagCheckboxes(isChecked) {
    if (!tagMenu) {
      return;
    }

    tagMenu.querySelectorAll(SELECTORS.tagCheckbox).forEach((checkbox) => {
      checkbox.checked = isChecked;
    });
  }

  function getCheckedTagValues() {
    if (!tagMenu) {
      return [];
    }

    return Array.from(
      tagMenu.querySelectorAll(SELECTORS.checkedTagCheckbox),
      (checkbox) => checkbox.value,
    );
  }

  function initTagMenu() {
    if (!tagMenu || !tagToggle) {
      return;
    }

    function submitTagsFilter() {
      navigateWithFilters({}, QUERY_KEYS.tag, getCheckedTagValues());
    }

    // Debounce tag selection so the user has time to select mutliple
    const debouncedSubmitTagsFilter = debounce(
      submitTagsFilter,
      TAG_SUBMIT_DEBOUNCE_MS,
    );

    tagMenu.querySelectorAll(SELECTORS.tagCheckbox).forEach((checkbox) => {
      checkbox.addEventListener("change", () => {
        updateTagsVisualState();
        debouncedSubmitTagsFilter();
      });
    });

    const selectAllButton = tagMenu.querySelector(SELECTORS.tagSelectAll);
    if (selectAllButton) {
      selectAllButton.addEventListener("click", (e) => {
        e.preventDefault();
        setAllTagCheckboxes(true);
        updateTagsVisualState();
        debouncedSubmitTagsFilter();
      });
    }

    const clearButton = tagMenu.querySelector(SELECTORS.tagClear);
    if (clearButton) {
      clearButton.addEventListener("click", (e) => {
        e.preventDefault();
        setAllTagCheckboxes(false);
        updateTagsVisualState();
        debouncedSubmitTagsFilter();
      });
    }
  }

  restoreFilterState();
  initSingleSelectMenus();
  setupTagMenuToggle();
  setupTagMenuStopPropagation();
  initTagMenu();
  document.addEventListener("click", closeAllMenus);
})();
