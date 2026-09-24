export const DEFAULT_FILTER_LIMIT = 5;

const DERIVED_FILTER_REFRESH_INTERVAL = 10000;
const DERIVED_FILTER_REFRESH_ATTEMPTS = 90;
let filterNavigateTimer = null;

function scheduleFilterNavigation() {
  clearTimeout(filterNavigateTimer);
  filterNavigateTimer = setTimeout(() => {
    window.location.assign(window.location.href);
  }, 300);
}

export function setFilterValue(url, key, value, isSelected) {
  const selectedValues = url.searchParams
    .getAll(key)
    .filter((selectedValue) => selectedValue !== value);

  if (isSelected) {
    selectedValues.push(value);
  }

  url.searchParams.delete(key);
  selectedValues.forEach((selectedValue) => {
    url.searchParams.append(key, selectedValue);
  });
  url.searchParams.delete("offset");
  return url;
}

function setSingleFilterValue(url, key, value) {
  if (value) {
    url.searchParams.set(key, value);
  } else {
    url.searchParams.delete(key);
  }
  url.searchParams.delete("offset");
  return url;
}

export function clearFilterValues(url, filterKeys) {
  filterKeys.forEach((key) => url.searchParams.delete(key));
  url.searchParams.delete("offset");
  return url;
}

function navigateTo(url) {
  const relativeUrl = `${url.pathname}${url.search}${url.hash}`;
  window.history.pushState({ path: relativeUrl }, "", relativeUrl);
  scheduleFilterNavigation();
}

function filterLimit(filterRoot) {
  return Number(filterRoot.dataset.filterLimit) || DEFAULT_FILTER_LIMIT;
}

function optionElements(group) {
  return [...group.querySelectorAll(".js-filter-option")];
}

export function updateOptionVisibility(group, limit = DEFAULT_FILTER_LIMIT) {
  const options = optionElements(group);
  const searchInput = group.querySelector(".js-filter-search");
  const resetButton = group.querySelector(".js-filter-search-reset");
  const toggleButton = group.querySelector(".js-toggle-filter-options");
  const noResults = group.querySelector(".js-filter-no-results");
  const query = searchInput?.value.trim().toLocaleLowerCase() || "";
  const isExpanded = toggleButton?.dataset.expanded === "true";
  let matchingIndex = 0;
  let visibleCount = 0;

  options.forEach((option) => {
    const matches = option.dataset.filterLabel.includes(query);
    const withinLimit = query || isExpanded || matchingIndex < limit;
    const isVisible = matches && withinLimit;

    option.classList.toggle("u-hide", !isVisible);
    if (matches) {
      matchingIndex += 1;
    }
    if (isVisible) {
      visibleCount += 1;
    }
  });

  if (resetButton) {
    resetButton.classList.toggle("u-hide", !query);
  }
  if (noResults) {
    noResults.classList.toggle("u-hide", visibleCount > 0);
  }
  if (toggleButton) {
    toggleButton.classList.toggle("u-hide", Boolean(query));
    toggleButton.textContent = isExpanded
      ? `Show fewer ${toggleButton.dataset.plural}`
      : `Show all ${toggleButton.dataset.plural}`;
  }
}

function updateSelectedCount(group) {
  const count = group.querySelectorAll('input[type="checkbox"]:checked').length;
  const badge = group.querySelector(".js-filter-count");

  badge.textContent = count;
  badge.setAttribute("aria-label", `${count} selected`);
  badge.classList.toggle("u-hide", count === 0);
}

function handleFilterChange(event) {
  const input = event.target.closest('input[type="checkbox"]');
  if (!input) {
    if (event.target.closest(".js-memory-range")) {
      applyMemoryRange(event.target.closest(".js-filter-group"), event.target);
    }
    return;
  }

  const group = input.closest(".js-filter-group");
  const url = new URL(window.location.href);

  if (group.dataset.filterSelection === "single") {
    if (input.checked) {
      group
        .querySelectorAll('input[type="checkbox"]:checked')
        .forEach((selectedInput) => {
          selectedInput.checked = selectedInput === input;
        });
    }
    updateSelectedCount(group);
    navigateTo(
      setSingleFilterValue(url, input.name, input.checked ? input.value : ""),
    );
    return;
  }

  updateSelectedCount(group);
  navigateTo(setFilterValue(url, input.name, input.value, input.checked));
}

function handleFilterInput(event, limit) {
  if (event.target.matches(".js-filter-search")) {
    updateOptionVisibility(event.target.closest(".js-filter-group"), limit);
  } else if (event.target.matches(".js-memory-min, .js-memory-max")) {
    updateMemoryRange(event.target.closest(".js-memory-range"), event.target);
  } else if (event.target.matches(".js-certified-year")) {
    event.target.value = event.target.value.replace(/\D/g, "").slice(0, 4);
    if (!event.target.value || isValidYear(event.target.value)) {
      setYearValidity(event.target, true);
    }
  }
}

function handleFilterKeydown(event) {
  if (event.target.matches(".js-filter-search") && event.key === "Enter") {
    event.preventDefault();
  } else if (
    event.target.matches(".js-certified-year") &&
    event.key === "Enter"
  ) {
    event.preventDefault();
    applyCertifiedYear(event.target);
  }
}

function handleFilterClick(event, limit) {
  const resetButton = event.target.closest(".js-filter-search-reset");
  if (resetButton) {
    const group = resetButton.closest(".js-filter-group");
    const input = group.querySelector(".js-filter-search");
    input.value = "";
    input.focus();
    updateOptionVisibility(group, limit);
    return;
  }

  const toggleButton = event.target.closest(".js-toggle-filter-options");
  if (toggleButton) {
    const isExpanded = toggleButton.dataset.expanded === "true";
    toggleButton.dataset.expanded = String(!isExpanded);
    updateOptionVisibility(toggleButton.closest(".js-filter-group"), limit);
  }
}

function filterKeys(filterRoot) {
  return [
    ...new Set(
      [...filterRoot.querySelectorAll(".js-filter-group")].flatMap((group) =>
        group.dataset.filterUrlKeys.split(",").filter(Boolean),
      ),
    ),
  ];
}

function initClearFilters(filterRoot) {
  const clearButton = document.querySelector(".js-clear-filters");
  clearButton?.addEventListener("click", () => {
    window.location.assign(
      clearFilterValues(
        new URL(window.location.href),
        filterKeys(filterRoot),
      ).toString(),
    );
  });
}

async function derivedFiltersAreReady() {
  const response = await fetch("/certified/filters.json?derived_status=1", {
    cache: "no-store",
    headers: { Accept: "application/json" },
  });
  if (!response.ok) {
    return false;
  }

  const payload = await response.json();
  return payload.derived_filters_pending === false;
}

function initDerivedFilterRefresh(filterRoot) {
  if (filterRoot.dataset.derivedFiltersPending !== "true") {
    return;
  }

  let attemptsRemaining = DERIVED_FILTER_REFRESH_ATTEMPTS;
  const checkForOptions = async () => {
    let optionsAreReady = false;
    try {
      optionsAreReady = await derivedFiltersAreReady();
    } catch {
      optionsAreReady = false;
    }

    if (optionsAreReady) {
      window.location.reload();
      return;
    }

    attemptsRemaining -= 1;
    if (attemptsRemaining > 0) {
      window.setTimeout(checkForOptions, DERIVED_FILTER_REFRESH_INTERVAL);
    } else {
      const status = filterRoot.querySelector(".js-derived-filters-status");
      if (status) {
        status.textContent =
          "Model family, GPU and processor options are temporarily unavailable.";
      }
    }
  };

  window.setTimeout(checkForOptions, DERIVED_FILTER_REFRESH_INTERVAL);
}

export function initCertifiedFilters() {
  const filterRoot = document.querySelector(".js-certified-filters");
  if (!filterRoot) {
    return;
  }

  const limit = filterLimit(filterRoot);
  filterRoot.querySelectorAll(".js-filter-group").forEach((group) => {
    updateOptionVisibility(group, limit);
  });
  filterRoot.querySelectorAll(".js-memory-range").forEach((container) => {
    updateMemoryRange(container);
  });

  filterRoot.addEventListener("change", handleFilterChange);
  filterRoot.addEventListener("input", (event) => {
    handleFilterInput(event, limit);
  });
  filterRoot.addEventListener("keydown", handleFilterKeydown);
  filterRoot.addEventListener("click", (event) => {
    handleFilterClick(event, limit);
  });
  filterRoot.addEventListener(
    "blur",
    (event) => {
      if (event.target.matches(".js-certified-year")) {
        applyCertifiedYear(event.target);
      }
    },
    true,
  );

  initClearFilters(filterRoot);
  initDerivedFilterRefresh(filterRoot);
}

function updateMemoryRange(container, changedInput) {
  const minimum = container.querySelector(".js-memory-min");
  const maximum = container.querySelector(".js-memory-max");

  if (Number(minimum.value) > Number(maximum.value)) {
    if (changedInput === minimum) {
      maximum.value = minimum.value;
    } else {
      minimum.value = maximum.value;
    }
  }

  container.querySelector(".js-memory-min-output").value = minimum.value;
  container.querySelector(".js-memory-max-output").value = maximum.value;
  updateSliderProgress(minimum);
  updateSliderProgress(maximum);
}

function updateSliderProgress(input) {
  const minimum = Number(input.min);
  const maximum = Number(input.max);
  const progress =
    ((Number(input.value) - minimum) / (maximum - minimum)) * 100;

  input.style.setProperty("--slider-progress", `${progress}%`);
  input.setAttribute("aria-valuetext", `${input.value} GB`);
}

function applyMemoryRange(group, changedInput) {
  const container = group.querySelector(".js-memory-range");
  const minimum = container.querySelector(".js-memory-min");
  const maximum = container.querySelector(".js-memory-max");
  const url = new URL(window.location.href);

  updateMemoryRange(container, changedInput);

  if (minimum.value === minimum.min) {
    url.searchParams.delete("memory_min");
  } else {
    url.searchParams.set("memory_min", minimum.value);
  }

  if (maximum.value === maximum.max) {
    url.searchParams.delete("memory_max");
  } else {
    url.searchParams.set("memory_max", maximum.value);
  }

  url.searchParams.delete("offset");
  navigateTo(url);
}

function isValidYear(value) {
  return /^\d{4}$/.test(value);
}

function setYearValidity(input, isValid) {
  const validation = input.closest(".certified-year-validation");
  const message = validation.querySelector(".js-certified-year-error");

  validation.classList.toggle("is-error", !isValid);
  input.setAttribute("aria-invalid", String(!isValid));
  message.classList.toggle("u-hide", isValid);
}

function applyCertifiedYear(input) {
  const value = input.value;
  const url = new URL(window.location.href);

  if (!value) {
    setYearValidity(input, true);
    if (url.searchParams.has("certified_year")) {
      navigateTo(setSingleFilterValue(url, "certified_year", ""));
    }
    return;
  }

  if (!isValidYear(value)) {
    setYearValidity(input, false);
    return;
  }

  setYearValidity(input, true);
  if (url.searchParams.get("certified_year") !== value) {
    navigateTo(setSingleFilterValue(url, "certified_year", value));
  }
}

function updateResultsPerPage() {
  const searchResults = document.querySelector(".js-search-results");
  const pageSizeTop = document.getElementById("page-size-top");
  const pageSizeBottom = document.getElementById("page-size-bottom");

  pageSizeTop?.addEventListener("change", () => {
    if (!searchResults.reportValidity()) {
      return;
    }
    searchResults.submit();
  });

  pageSizeBottom?.addEventListener("change", (event) => {
    pageSizeTop.value = event.target.value;
    pageSizeTop.dispatchEvent(new Event("change"));
  });
}

function hideDrawerPageReload() {
  if (window.location.href.includes("drawer")) {
    document.querySelector("#toggle-filters")?.click();
  }
}

initCertifiedFilters();
updateResultsPerPage();
hideDrawerPageReload();
