/*
 * Page-specific behaviour for /about/release-cycle:
 * - Cascade behaviour for the filter bar (Product > Release > Version) and
 *   the Compliance menu's "Any" semantics.
 * - Tooltip close/reopen, sticky table header, and horizontal-scroll fade
 *   for the coverage tables.
 */

/*
 * Supplementary cascade behaviour for the release-cycle filter bar.
 *
 * The Product, Release and Version menus are rendered with the shared
 * single_select_menu macro and wired up by filter-menu.js. Every Release and
 * Version option for every product/deployment is pre-rendered and tagged with
 * its parent group (data-product / data-release). This script only toggles the
 * visibility of those options (and enables/disables the child toggles) based on
 * the current parent selection, and resets child menus when a parent changes.
 *
 * It never rebuilds option DOM or rebinds filter-menu.js handlers; it relies on
 * filter-menu.js having already restored data-selected-value from the URL and
 * set it synchronously on option clicks.
 *
 * It also owns the Compliance menu's "Any" behaviour (nothing checked or
 * everything checked both mean "no restriction"). That policy is specific to
 * this page, not a generic property of multi-select filter menus, so it lives
 * here rather than in the shared filter-menu.js.
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
  // auto-select a menu's only available option (mirrors filter-menu.js's own
  // setToggleLabel, kept local since that function is private to its closure).
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
    const visibleOptions = [];
    optionsOf(releaseMenu).forEach((option) => {
      const optionProduct = option.dataset.product;
      // Options without a product tag (if any) are always shown.
      const visible = !optionProduct || optionProduct === product;
      option.hidden = !visible;
      if (visible && optionProduct) {
        visibleOptions.push(option);
      }
    });
    setToggleDisabled(releaseToggle, !product || visibleOptions.length === 0);

    // Auto-select the release when it's the only one available for this
    // product, so Version can become usable without an extra click.
    if (
      product &&
      visibleOptions.length === 1 &&
      !selectedValue(releaseToggle)
    ) {
      autoSelectOption(releaseToggle, visibleOptions[0]);
    }
  }

  function applyVersionVisibility() {
    const product = selectedValue(productToggle);
    const release = selectedValue(releaseToggle);
    const visibleVersionOptions = [];
    optionsOf(versionMenu).forEach((option) => {
      const optionProduct = option.dataset.product;
      const optionRelease = option.dataset.release;
      // The "All versions" reset option has no parent tags: always visible.
      const visible =
        !optionProduct ||
        (optionProduct === product && optionRelease === release);
      option.hidden = !visible;
      if (visible && optionProduct) {
        visibleVersionOptions.push(option);
      }
    });
    // Version can be chosen once a release is selected ("All versions" default).
    setToggleDisabled(versionToggle, !release);

    // Auto-select the lone version when a release has exactly one available
    // version (mirrors the release auto-select above). This overrides the
    // "all versions" default too, matching the previous native-select
    // behaviour of auto-picking a release's only version.
    const currentVersion = selectedValue(versionToggle);
    if (
      release &&
      visibleVersionOptions.length === 1 &&
      (!currentVersion || currentVersion === "all")
    ) {
      autoSelectOption(versionToggle, visibleVersionOptions[0]);
    }
  }

  // --- Compliance "Any" behaviour -------------------------------------
  // Page-specific policy: nothing checked or everything checked both mean
  // "no restriction" for Compliance, rendered as the "Any" label. This is
  // deliberately not a filter-menu.js feature (see module comment above).
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

  function complianceCheckedCount() {
    return complianceCheckboxes().filter((checkbox) => checkbox.checked)
      .length;
  }

  function setAllComplianceCheckboxes(isChecked) {
    complianceCheckboxes().forEach((checkbox) => {
      checkbox.checked = isChecked;
    });
  }

  // Recompute the compliance toggle's label/badge/active state. Runs after
  // filter-menu.js's own generic handling on the same events (script load
  // order), overriding it with the "Any" policy.
  function updateComplianceVisualState() {
    if (!complianceToggle) {
      return;
    }
    const total = complianceCheckboxes().length;
    const checkedCount = complianceCheckedCount();
    const isAnyState = checkedCount === 0 || checkedCount === total;

    const labelSpan = complianceToggle.querySelector("span");
    if (labelSpan) {
      // Partial selection shows only the count badge, no label text.
      labelSpan.textContent = isAnyState ? ANY_LABEL : "";
    }

    const count = complianceToggle.querySelector("[data-filter-count]");
    if (count) {
      count.textContent = String(isAnyState ? total : checkedCount);
      count.hidden = false;
    }

    const chevron = complianceToggle.querySelector(
      ".p-contextual-menu__indicator",
    );
    if (chevron) {
      chevron.hidden = true;
    }

    complianceToggle.classList.add("is-active");
  }

  // Whether compliance itself is actively filtering (a strict subset
  // checked); none-checked and all-checked both mean "no restriction".
  function complianceIsActive() {
    const total = complianceCheckboxes().length;
    const checkedCount = complianceCheckedCount();
    return checkedCount > 0 && checkedCount < total;
  }

  // Mirrors filter-menu.js's own (generic) single-toggle active-detection,
  // so this override combines correctly with it rather than replacing it.
  function otherTogglesActive() {
    return [productToggle, releaseToggle, versionToggle].some((toggle) => {
      if (!toggle) {
        return false;
      }
      const value = toggle.dataset.selectedValue || "";
      const baseline = toggle.dataset.filterDefaultValue;
      return baseline !== undefined ? value !== baseline : Boolean(value);
    });
  }

  // filter-menu.js's own updateClearVisibility() runs first on every shared
  // event (attached before this script's listeners) and knows nothing about
  // the "Any" policy, so it treats compliance's default (all checked) state
  // as an active filter. Recompute the correct visibility afterwards.
  function updateClearButtonVisibility() {
    const clearButton = bar.querySelector("[data-filter-clear]");
    if (!clearButton) {
      return;
    }
    const isActive = otherTogglesActive() || complianceIsActive();
    clearButton.classList.toggle("u-hide", !isActive);
  }

  function initComplianceAnyBehaviour() {
    if (!complianceToggle || !complianceMenu) {
      return;
    }

    // No explicit ?compliance= param in the URL: default to "Any", shown as
    // every checkbox checked. filter-menu.js's own generic URL restore
    // leaves them unchecked when the URL has no matching param at all.
    const params = new URL(window.location).searchParams;
    if (!params.has("compliance")) {
      setAllComplianceCheckboxes(true);
    }
    updateComplianceVisualState();

    complianceCheckboxes().forEach((checkbox) => {
      checkbox.addEventListener("change", () => {
        updateComplianceVisualState();
        updateClearButtonVisibility();
      });
    });

    const selectAll = complianceMenu.querySelector("[data-filter-select-all]");
    if (selectAll) {
      selectAll.addEventListener("click", () => {
        updateComplianceVisualState();
        updateClearButtonVisibility();
      });
    }

    const clearSelection = complianceMenu.querySelector(
      "[data-filter-clear-selection]",
    );
    if (clearSelection) {
      clearSelection.addEventListener("click", () => {
        updateComplianceVisualState();
        updateClearButtonVisibility();
      });
    }
  }

  optionsOf(productMenu).forEach((option) => {
    option.addEventListener("click", () => {
      // filter-menu.js has already set productToggle.dataset.selectedValue.
      resetToggle(releaseToggle);
      resetToggle(versionToggle);
      applyReleaseVisibility();
      applyVersionVisibility();
      updateClearButtonVisibility();
    });
  });

  optionsOf(releaseMenu).forEach((option) => {
    option.addEventListener("click", () => {
      resetToggle(versionToggle);
      applyVersionVisibility();
      updateClearButtonVisibility();
    });
  });

  optionsOf(versionMenu).forEach((option) => {
    option.addEventListener("click", () => {
      updateClearButtonVisibility();
    });
  });

  const outerClearButton = bar.querySelector("[data-filter-clear]");
  if (outerClearButton) {
    outerClearButton.addEventListener("click", () => {
      // filter-menu.js's own handler (attached first) either navigates away
      // (submitted query: nothing left to fix up here) or, for the
      // "not yet submitted" in-place reset, unchecks every compliance box.
      // Re-check them to restore the "Any" default rather than leaving
      // compliance empty.
      setAllComplianceCheckboxes(true);
      updateComplianceVisualState();
      updateClearButtonVisibility();
    });
  }

  // Initial state (filter-menu.js has already restored selections from the URL).
  applyReleaseVisibility();
  applyVersionVisibility();
  initComplianceAnyBehaviour();
  updateClearButtonVisibility();
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

function initStickyHeader() {
  const stickyTables = document.querySelectorAll(".js-sticky-table");
  if (!stickyTables.length) return;

  stickyTables.forEach((table) => {
    const thead = table.querySelector("thead");
    if (!thead) return;

    const updateHeaderShadow = () => {
      const computed = getComputedStyle(thead);
      const stickyTop = parseFloat(computed.top) || 0;
      const rect = thead.getBoundingClientRect();

      // Sticky when thead has reached its sticky offset but still in view
      const isSticky =
        rect.top <= stickyTop + 1 && // at or above sticky top
        rect.bottom > stickyTop + 1; // header still visible

      thead.classList.toggle("is-sticky", isSticky);
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
