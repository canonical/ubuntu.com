/*
 * Discovers every [data-js-filters] bar and its menus from the DOM.
 * Param keys, default labels and reset params are read from data-* attributes,
 * so menus can be used on any page in any order or quantity.
 */

const HOOKS = {
  bar: "[data-js-filters]",
  toggle: "[data-filter-param]",
  singleToggle: '[data-filter-type="single"]',
  multiToggle: '[data-filter-type="multi"]',
  option: ".p-filter-menu__link",
  checkbox: "[data-filter-option]",
  checkedCheckbox: "[data-filter-option]:checked",
  labelText: ".p-filter-menu__label-text",
  count: "[data-filter-count]",
  selectAll: "[data-filter-select-all]",
  clearSelection: "[data-filter-clear-selection]",
  submit: "[data-filter-submit]",
  clear: "[data-filter-clear]",
};

function urlParams() {
  return new URL(window.location).searchParams;
}

function setButtonLoading(button) {
  button.classList.add("has-icon");
  const spinnerIcon = document.createElement("i");
  spinnerIcon.className = "p-icon--spinner u-animation--spin is-light";
  const buttonRect = button.getBoundingClientRect();
  button.style.width = buttonRect.width + "px";
  button.style.height = buttonRect.height + "px";
  button.disabled = true;
  button.replaceChildren(spinnerIcon);
}

function setupFilterBar(bar) {
  bar.classList.remove("u-hide");

  const resetParams = (bar.dataset.filterResetParams || "")
    .split(/\s+/)
    .filter(Boolean);
  const singleToggles = Array.from(bar.querySelectorAll(HOOKS.singleToggle));
  const multiToggles = Array.from(bar.querySelectorAll(HOOKS.multiToggle));

  function dropdownFor(toggle) {
    return document.getElementById(toggle.getAttribute("aria-controls"));
  }

  function closeAllMenus() {
    bar.querySelectorAll(HOOKS.toggle).forEach((toggle) => {
      toggle.setAttribute("aria-expanded", "false");
      const menu = dropdownFor(toggle);
      if (menu) {
        menu.setAttribute("aria-hidden", "true");
      }
    });
  }

  function toggleMenu(toggle, isOpen) {
    closeAllMenus();
    if (!isOpen) {
      toggle.setAttribute("aria-expanded", "true");
      const menu = dropdownFor(toggle);
      if (menu) {
        menu.setAttribute("aria-hidden", "false");
      }
    }
  }

  // The first span in a toggle holds the label (a second span may hold a count)
  function setToggleLabel(toggle, text) {
    const label = toggle.querySelector("span");
    if (label) {
      label.textContent = text;
    }
    toggle.classList.add("is-active");
  }

  function resetToggleLabel(toggle) {
    const label = toggle.querySelector("span");
    if (label && toggle.dataset.defaultLabel !== undefined) {
      label.textContent = toggle.dataset.defaultLabel;
    }
    toggle.classList.remove("is-active");
  }

  function getCheckedValues(toggle) {
    const menu = dropdownFor(toggle);
    if (!menu) {
      return [];
    }
    return Array.from(
      menu.querySelectorAll(HOOKS.checkedCheckbox),
      (checkbox) => checkbox.value,
    );
  }

  function setAllCheckboxes(toggle, isChecked) {
    const menu = dropdownFor(toggle);
    if (!menu) {
      return;
    }
    menu.querySelectorAll(HOOKS.checkbox).forEach((checkbox) => {
      checkbox.checked = isChecked;
    });
  }

  function updateMultiVisualState(toggle) {
    const menu = dropdownFor(toggle);
    if (!menu) {
      return;
    }

    menu.querySelectorAll(HOOKS.checkbox).forEach((checkbox) => {
      const label = checkbox.nextElementSibling;
      if (label && label.classList.contains("p-checkbox__label")) {
        const labelText = label.querySelector(HOOKS.labelText);
        if (labelText) {
          labelText.classList.toggle("p-heading--5", checkbox.checked);
        }
      }
    });

    const checked = menu.querySelectorAll(HOOKS.checkedCheckbox);
    const count = toggle.querySelector(HOOKS.count);
    if (count) {
      count.textContent = String(checked.length);
      count.style.display = checked.length === 0 ? "none" : "";
    }
    toggle.classList.toggle("is-active", checked.length > 0);
  }

  function restoreSingleToggle(toggle) {
    const value = urlParams().get(toggle.dataset.filterParam);
    if (!value) {
      return;
    }
    const menu = dropdownFor(toggle);
    if (!menu) {
      return;
    }
    const option = menu.querySelector(`[data-value="${value}"]`);
    if (!option) {
      return;
    }
    toggle.dataset.selectedValue = value;
    setToggleLabel(toggle, option.textContent);
  }

  function restoreMultiToggle(toggle) {
    const menu = dropdownFor(toggle);
    if (!menu) {
      return;
    }
    const selected = new Set(urlParams().getAll(toggle.dataset.filterParam));
    menu.querySelectorAll(HOOKS.checkbox).forEach((checkbox) => {
      checkbox.checked = selected.has(checkbox.value);
    });
    updateMultiVisualState(toggle);
  }

  function hasActiveSelections() {
    const single = singleToggles.some((toggle) => {
      const value = toggle.dataset.selectedValue;
      return value && value !== "all";
    });
    const multi = multiToggles.some(
      (toggle) => getCheckedValues(toggle).length > 0,
    );
    return single || multi;
  }

  function updateClearVisibility() {
    const clearButton = bar.querySelector(HOOKS.clear);
    if (!clearButton) {
      return;
    }
    clearButton.classList.toggle("u-hide", !hasActiveSelections());
  }

  // A query is considered "submitted" when the URL already carries a param
  // controlled by one of this bar's menus.
  function hasSubmittedQuery() {
    const params = urlParams();
    return (
      singleToggles.some((toggle) => params.has(toggle.dataset.filterParam)) ||
      multiToggles.some((toggle) => params.has(toggle.dataset.filterParam))
    );
  }

  function navigateWithFilters(singleUpdates, multiUpdates) {
    const nextUrl = new URL(window.location);

    Object.keys(singleUpdates).forEach((key) => {
      const value = singleUpdates[key];
      if (value === null) {
        nextUrl.searchParams.delete(key);
      } else {
        nextUrl.searchParams.set(key, value);
      }
    });

    Object.keys(multiUpdates).forEach((key) => {
      nextUrl.searchParams.delete(key);
      multiUpdates[key].forEach((value) => {
        nextUrl.searchParams.append(key, value);
      });
    });

    resetParams.forEach((key) => nextUrl.searchParams.delete(key));
    window.location = nextUrl.href;
  }

  function collectSingleUpdates(reset) {
    const updates = {};
    singleToggles.forEach((toggle) => {
      if (reset) {
        updates[toggle.dataset.filterParam] = null;
        return;
      }
      const value = toggle.dataset.selectedValue;
      updates[toggle.dataset.filterParam] =
        value && value !== "all" ? value : null;
    });
    return updates;
  }

  function collectMultiUpdates(reset) {
    const updates = {};
    multiToggles.forEach((toggle) => {
      updates[toggle.dataset.filterParam] = reset
        ? []
        : getCheckedValues(toggle);
    });
    return updates;
  }

  function submitFilters() {
    navigateWithFilters(collectSingleUpdates(false), collectMultiUpdates(false));
  }

  function clearSelections() {
    singleToggles.forEach((toggle) => {
      delete toggle.dataset.selectedValue;
      resetToggleLabel(toggle);
    });
    multiToggles.forEach((toggle) => {
      setAllCheckboxes(toggle, false);
      updateMultiVisualState(toggle);
    });
    updateClearVisibility();
  }

  function initSingleToggle(toggle) {
    const menu = dropdownFor(toggle);
    if (!menu) {
      return;
    }

    toggle.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      toggleMenu(toggle, toggle.getAttribute("aria-expanded") === "true");
    });

    menu.querySelectorAll(HOOKS.option).forEach((optionLink) => {
      optionLink.addEventListener("click", () => {
        setToggleLabel(toggle, optionLink.textContent);
        toggle.setAttribute("aria-expanded", "false");
        menu.setAttribute("aria-hidden", "true");
        toggle.dataset.selectedValue = optionLink.getAttribute("data-value");
        updateClearVisibility();
      });
    });
  }

  function initMultiToggle(toggle) {
    const menu = dropdownFor(toggle);
    if (!menu) {
      return;
    }

    toggle.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      toggleMenu(toggle, toggle.getAttribute("aria-expanded") === "true");
    });

    // Keep the menu open while interacting with its checkboxes/actions
    menu.addEventListener("click", (e) => e.stopPropagation());

    menu.querySelectorAll(HOOKS.checkbox).forEach((checkbox) => {
      checkbox.addEventListener("change", () => {
        updateMultiVisualState(toggle);
        updateClearVisibility();
      });
    });

    const selectAll = menu.querySelector(HOOKS.selectAll);
    if (selectAll) {
      selectAll.addEventListener("click", (e) => {
        e.preventDefault();
        setAllCheckboxes(toggle, true);
        updateMultiVisualState(toggle);
        updateClearVisibility();
      });
    }

    const clearSelection = menu.querySelector(HOOKS.clearSelection);
    if (clearSelection) {
      clearSelection.addEventListener("click", (e) => {
        e.preventDefault();
        setAllCheckboxes(toggle, false);
        updateMultiVisualState(toggle);
        updateClearVisibility();
      });
    }
  }

  function initSubmitButton() {
    const submitButton = bar.querySelector(HOOKS.submit);
    if (!submitButton) {
      return;
    }
    submitButton.addEventListener("click", (e) => {
      e.preventDefault();
      setButtonLoading(submitButton);
      submitFilters();
    });
  }

  function initClearButton() {
    const clearButton = bar.querySelector(HOOKS.clear);
    if (!clearButton) {
      return;
    }
    clearButton.addEventListener("click", (e) => {
      e.preventDefault();

      // First-time selection (nothing submitted yet): reset in place, no reload.
      if (!hasSubmittedQuery()) {
        clearSelections();
        return;
      }

      clearButton.disabled = true;
      const submitButton = bar.querySelector(HOOKS.submit);
      if (submitButton) {
        setButtonLoading(submitButton);
      }
      navigateWithFilters(collectSingleUpdates(true), collectMultiUpdates(true));
    });
  }

  singleToggles.forEach(restoreSingleToggle);
  multiToggles.forEach(restoreMultiToggle);
  singleToggles.forEach(initSingleToggle);
  multiToggles.forEach(initMultiToggle);
  initSubmitButton();
  initClearButton();
  updateClearVisibility();

  document.addEventListener("click", closeAllMenus);
}

(function initFilterMenus() {
  document.querySelectorAll(HOOKS.bar).forEach(setupFilterBar);
})();
