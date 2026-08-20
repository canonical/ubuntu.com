/* Custom implementation for contextual menu on /engage.
 * https://vanillaframework.io/docs/patterns/contextual-menu
 */

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
  submitButton: ".js-engage-filters-submit",
  clearButton: ".js-engage-filters-clear",
};

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
      closeAllMenus();
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

    toggle.dataset.selectedValue = value;
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

          toggle.dataset.selectedValue = optionLink.getAttribute("data-value");
          updateClearFiltersVisibility();
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

    tagMenu.querySelectorAll(SELECTORS.tagCheckbox).forEach((checkbox) => {
      checkbox.addEventListener("change", () => {
        updateTagsVisualState();
        updateClearFiltersVisibility();
      });
    });

    const selectAllButton = tagMenu.querySelector(SELECTORS.tagSelectAll);
    if (selectAllButton) {
      selectAllButton.addEventListener("click", (e) => {
        e.preventDefault();
        setAllTagCheckboxes(true);
        updateTagsVisualState();
        updateClearFiltersVisibility();
      });
    }

    const clearButton = tagMenu.querySelector(SELECTORS.tagClear);
    if (clearButton) {
      clearButton.addEventListener("click", (e) => {
        e.preventDefault();
        setAllTagCheckboxes(false);
        updateTagsVisualState();
        updateClearFiltersVisibility();
      });
    }
  }

  function hasActiveSelections() {
    const singleSelected = SINGLE_SELECT_PARAMS.some((paramKey) => {
      const toggle = document.querySelector(
        `[aria-controls="${menuIdFor(paramKey)}"]`,
      );
      const value = toggle ? toggle.dataset.selectedValue : null;
      return value && value !== "all";
    });

    return singleSelected || getCheckedTagValues().length > 0;
  }

  function updateClearFiltersVisibility() {
    const clearButton = document.querySelector(SELECTORS.clearButton);
    if (!clearButton) {
      return;
    }
    clearButton.classList.toggle("u-hide", !hasActiveSelections());
  }

  function setSubmitButtonLoading(button) {
    button.classList.add("has-icon");
    const spinnerIcon = document.createElement("i");
    spinnerIcon.className = "p-icon--spinner u-animation--spin is-light";
    const buttonRect = button.getBoundingClientRect();
    button.style.width = buttonRect.width + "px";
    button.style.height = buttonRect.height + "px";
    button.disabled = true;
    button.replaceChildren(spinnerIcon);
  }

  function submitFilters() {
    const singleValueUpdates = {};
    SINGLE_SELECT_PARAMS.forEach((paramKey) => {
      const toggle = document.querySelector(
        `[aria-controls="${menuIdFor(paramKey)}"]`,
      );
      const value = toggle ? toggle.dataset.selectedValue : null;
      singleValueUpdates[paramKey] = value && value !== "all" ? value : null;
    });

    navigateWithFilters(
      singleValueUpdates,
      QUERY_KEYS.tag,
      getCheckedTagValues(),
    );
  }

  function initSubmitButton() {
    const submitButton = document.querySelector(SELECTORS.submitButton);
    if (!submitButton) {
      return;
    }

    submitButton.addEventListener("click", (e) => {
      e.preventDefault();
      setSubmitButtonLoading(submitButton);
      submitFilters();
    });
  }

  function initClearButton() {
    const clearButton = document.querySelector(SELECTORS.clearButton);
    if (!clearButton) {
      return;
    }

    clearButton.addEventListener("click", (e) => {
      e.preventDefault();
      clearButton.disabled = true;

      const submitButton = document.querySelector(SELECTORS.submitButton);
      if (submitButton) {
        setSubmitButtonLoading(submitButton);
      }

      const singleValueUpdates = {};
      SINGLE_SELECT_PARAMS.forEach((paramKey) => {
        singleValueUpdates[paramKey] = null;
      });
      navigateWithFilters(singleValueUpdates, QUERY_KEYS.tag, []);
    });
  }

  restoreFilterState();
  initSingleSelectMenus();
  setupTagMenuToggle();
  setupTagMenuStopPropagation();
  initTagMenu();
  initSubmitButton();
  initClearButton();
  updateClearFiltersVisibility();
  document.addEventListener("click", closeAllMenus);
})();
