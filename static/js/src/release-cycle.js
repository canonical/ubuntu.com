/*
 * Extension of the filter-menu.js script.
 * Page-specific behaviour for /about/release-cycle:
 * - Show/hide the relevant menu items
 * - Cascade behaviour for the filter bar (Product > Release > Version) and
 *   the Compliance menu's "Any" semantics, e.g. if there is one option, autoselect it
 * - Tooltip close/reopen, sticky table header, and horizontal-scroll fade
 *   for the coverage tables.
 */
(function initReleaseCycleCascade() {
  const bar = document.querySelector("[data-js-release-cycle-filters]");
  if (!bar) {
    return;
  }

  function singleToggle(param) {
    return bar.querySelector(
      '[data-filter-param="' + param + '"][data-filter-type="single"]',
    );
  }

  function menuFor(toggle) {
    return toggle
      ? document.getElementById(toggle.getAttribute("aria-controls"))
      : null;
  }

  function selectedValue(toggle) {
    return toggle && toggle.dataset.selectedValue
      ? toggle.dataset.selectedValue
      : "";
  }

  function optionsOf(menu) {
    return menu
      ? Array.from(menu.querySelectorAll(".p-filter-menu__link"))
      : [];
  }

  function applyChildVisibility(menu, matches) {
    const keys = Object.keys(matches);
    const visibleOptions = [];
    optionsOf(menu).forEach((option) => {
      const isTagged = keys.some((key) => option.dataset[key] !== undefined);
      const visible =
        !isTagged || keys.every((key) => option.dataset[key] === matches[key]);
      option.hidden = !visible;
      if (visible && isTagged) {
        visibleOptions.push(option);
      }
    });
    return visibleOptions;
  }

  function setToggleDisabled(toggle, disabled) {
    if (!toggle) {
      return;
    }
    toggle.disabled = disabled;
    toggle.classList.toggle("is-disabled", disabled);
    if (disabled) {
      toggle.setAttribute("aria-expanded", "false");
      const menu = menuFor(toggle);
      if (menu) {
        menu.setAttribute("aria-hidden", "true");
      }
    }
  }

  function resetToggle(toggle) {
    if (!toggle) {
      return;
    }
    delete toggle.dataset.selectedValue;
    const label = toggle.querySelector("span");
    if (label && toggle.dataset.defaultLabel !== undefined) {
      label.textContent = toggle.dataset.defaultLabel;
    }
    toggle.classList.remove("is-active");
  }

  // Directly mark an option as selected without simulating a click, used to
  // auto-select a menu's only available option
  function autoSelectOption(toggle, option) {
    if (!toggle || !option) {
      return;
    }
    toggle.dataset.selectedValue = option.dataset.value;
    const label = toggle.querySelector("span");
    if (label) {
      label.textContent = option.textContent;
    }
    toggle.classList.add("is-active");
  }

  const productToggle = singleToggle("product");
  const releaseToggle = singleToggle("release");
  const versionToggle = singleToggle("version");
  const productMenu = menuFor(productToggle);
  const releaseMenu = menuFor(releaseToggle);
  const versionMenu = menuFor(versionToggle);

  function applyReleaseVisibility() {
    const product = selectedValue(productToggle);
    const visibleOptions = applyChildVisibility(releaseMenu, { product });
    setToggleDisabled(releaseToggle, !product || visibleOptions.length === 0);

    // Auto-select the release when it's the only one available
    if (
      product &&
      visibleOptions.length === 1 &&
      !selectedValue(releaseToggle)
    ) {
      autoSelectOption(releaseToggle, visibleOptions[0]);
    }
  }

  function applyVersionVisibility() {
    const release = selectedValue(releaseToggle);
    applyChildVisibility(versionMenu, {
      product: selectedValue(productToggle),
      release,
    });
    // Version can be chosen once a release is selected ("All versions" default).
    setToggleDisabled(versionToggle, !release);
  }

  const ANY_LABEL = "Any";
  const complianceToggle = bar.querySelector(
    '[data-filter-param="compliance"][data-filter-type="multi"]',
  );
  const complianceMenu = menuFor(complianceToggle);

  function complianceCheckboxes() {
    return complianceMenu
      ? Array.from(complianceMenu.querySelectorAll("[data-filter-option]"))
      : [];
  }

  function setAllComplianceCheckboxes(isChecked) {
    complianceCheckboxes().forEach((checkbox) => {
      checkbox.checked = isChecked;
    });
  }

  function updateComplianceVisualState() {
    if (!complianceToggle) {
      return;
    }
    const checkboxes = complianceCheckboxes();
    const checkedCheckboxes = checkboxes.filter((checkbox) => checkbox.checked);
    const total = checkboxes.length;
    const checkedCount = checkedCheckboxes.length;
    const isAnyState = checkedCount === 0 || checkedCount === total;

    const labelSpan = complianceToggle.querySelector("span");
    if (labelSpan) {
      const selectedLabels = checkedCheckboxes
        .map((checkbox) => checkbox.nextElementSibling?.textContent.trim())
        .filter(Boolean);

      labelSpan.textContent = isAnyState
        ? ANY_LABEL
        : selectedLabels.join(", ");
    }

    const chevron = complianceToggle.querySelector(
      ".p-contextual-menu__indicator",
    );
    if (chevron) {
      chevron.hidden = false;
    }

    complianceToggle.classList.add("is-active");

    // Nothing left to select once every option is already checked
    const selectAll = complianceMenu?.querySelector(
      "[data-filter-select-all]",
    );
    if (selectAll) {
      const allSelected = total > 0 && checkedCount === total;
      selectAll.disabled = allSelected;
      selectAll.setAttribute("aria-disabled", String(allSelected));
    }
  }

  function initComplianceAnyBehaviour() {
    if (!complianceToggle || !complianceMenu) {
      return;
    }

    // No explicit ?compliance= param in the URL: default to "Any", shown as
    // every checkbox checked
    const params = new URL(window.location).searchParams;
    if (!params.has("compliance")) {
      setAllComplianceCheckboxes(true);
    }
    updateComplianceVisualState();

    complianceCheckboxes().forEach((checkbox) => {
      checkbox.addEventListener("change", () => {
        updateComplianceVisualState();
      });
    });

    const selectAll = complianceMenu.querySelector("[data-filter-select-all]");
    if (selectAll) {
      selectAll.addEventListener("click", () => {
        updateComplianceVisualState();
      });
    }
  }

  optionsOf(productMenu).forEach((option) => {
    option.addEventListener("click", () => {
      resetToggle(releaseToggle);
      resetToggle(versionToggle);
      applyReleaseVisibility();
      applyVersionVisibility();
    });
  });

  optionsOf(releaseMenu).forEach((option) => {
    option.addEventListener("click", () => {
      resetToggle(versionToggle);
      applyVersionVisibility();
    });
  });

  // Initial state
  applyReleaseVisibility();
  applyVersionVisibility();
  initComplianceAnyBehaviour();
})();

/*
 * Tooltip close/reopen, sticky table header, and horizontal-scroll fade
 * behaviour for the release-cycle coverage tables.
 */
const tooltips = document.querySelectorAll(".js-component-tooltip");

// Close button logic for release tooltips
tooltips.forEach((tooltip) => {
  const closeButton = tooltip.querySelector(".js-tooltip-close");
  if (!closeButton) return;

  closeButton.addEventListener("click", (event) => {
    event.stopPropagation();
    tooltip.classList.add("is-tooltip-closed");
  });

  tooltip.addEventListener("mouseleave", () => {
    tooltip.classList.remove("is-tooltip-closed");
  });
});

function closeOpenFilterMenus() {
  const bar = document.querySelector("[data-js-release-cycle-filters]");
  if (!bar) return;

  bar.querySelectorAll('[data-filter-param][aria-expanded="true"]').forEach(
    (toggle) => {
      toggle.setAttribute("aria-expanded", "false");
      const menu = document.getElementById(
        toggle.getAttribute("aria-controls"),
      );
      if (menu) {
        menu.setAttribute("aria-hidden", "true");
      }
    },
  );
}

function initStickyHeader() {
  const stickyTables = document.querySelectorAll(".js-sticky-table");
  if (!stickyTables.length) return;

  stickyTables.forEach((table) => {
    const thead = table.querySelector("thead");
    if (!thead) return;

    let wasSticky = false;

    const updateHeaderShadow = () => {
      const computed = getComputedStyle(thead);
      const stickyTop = parseFloat(computed.top) || 0;
      const rect = thead.getBoundingClientRect();

      // Sticky when thead has reached its sticky offset but still in view
      const isSticky =
        rect.top <= stickyTop + 1 && // at or above sticky top
        rect.bottom > stickyTop + 1; // header still visible

      thead.classList.toggle("is-sticky", isSticky);

      // Close any open dropdowns as the header becomes sticky
      if (isSticky && !wasSticky) {
        closeOpenFilterMenus();
      }
      wasSticky = isSticky;
    };

    window.addEventListener("scroll", updateHeaderShadow, { passive: true });
    window.addEventListener("resize", updateHeaderShadow);

    updateHeaderShadow();
  });
}

function initScrollFade() {
  const container = document.querySelector(".release-cycle-table-scroll");
  const scrollWrapper = container?.querySelector(
    ".release-cycle-table-scroll-inner",
  );
  if (!container || !scrollWrapper) return;

  const updateScrollFade = () => {
    const maxScrollLeft = scrollWrapper.scrollWidth - scrollWrapper.clientWidth;

    // If there's no horizontal overflow, hide the gradient
    if (maxScrollLeft <= 1) {
      container.classList.add("is-at-end");
      return;
    }

    const atEnd = scrollWrapper.scrollLeft >= maxScrollLeft - 2;
    container.classList.toggle("is-at-end", atEnd);
  };

  scrollWrapper.addEventListener("scroll", updateScrollFade, { passive: true });
  window.addEventListener("resize", updateScrollFade);

  updateScrollFade();
}

document.addEventListener("DOMContentLoaded", () => {
  initStickyHeader();
  initScrollFade();
});
