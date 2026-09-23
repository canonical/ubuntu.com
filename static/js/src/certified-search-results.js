export const DEFAULT_FILTER_LIMIT = 5;

const SCROLL_POSITION_KEY = "certifiedFiltersScrollY";
let filterNavigateTimer = null;

function saveScrollPosition() {
  sessionStorage.setItem(SCROLL_POSITION_KEY, window.scrollY);
}

function scheduleFilterNavigation() {
  clearTimeout(filterNavigateTimer);
  filterNavigateTimer = setTimeout(() => {
    saveScrollPosition();
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
    return;
  }

  updateSelectedCount(input.closest(".js-filter-group"));
  navigateTo(
    setFilterValue(
      new URL(window.location.href),
      input.name,
      input.value,
      input.checked,
    ),
  );
}

function handleFilterInput(event, limit) {
  if (event.target.matches(".js-filter-search")) {
    updateOptionVisibility(event.target.closest(".js-filter-group"), limit);
  }
}

function handleFilterKeydown(event) {
  if (event.target.matches(".js-filter-search") && event.key === "Enter") {
    event.preventDefault();
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
  return [...filterRoot.querySelectorAll(".js-filter-group")].map(
    (group) => group.dataset.filterKey,
  );
}

function initClearFilters(filterRoot) {
  const clearButton = document.querySelector(".js-clear-filters");
  clearButton?.addEventListener("click", () => {
    saveScrollPosition();
    window.location.assign(
      clearFilterValues(
        new URL(window.location.href),
        filterKeys(filterRoot),
      ).toString(),
    );
  });
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

  filterRoot.addEventListener("change", handleFilterChange);
  filterRoot.addEventListener("input", (event) => {
    handleFilterInput(event, limit);
  });
  filterRoot.addEventListener("keydown", handleFilterKeydown);
  filterRoot.addEventListener("click", (event) => {
    handleFilterClick(event, limit);
  });

  initClearFilters(filterRoot);
}

function updateResultsPerPage() {
  const searchResults = document.querySelector(".js-search-results");
  const pageSizeTop = document.getElementById("page-size-top");
  const pageSizeBottom = document.getElementById("page-size-bottom");

  pageSizeTop?.addEventListener("change", () => {
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
