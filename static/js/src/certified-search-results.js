// New filters
const filters2Elm = document.querySelector("#tab2-section");
const filters3Elm = document.querySelector("#tab3-section");
const filters1Elm = document.querySelector("#tab1-section");
const showAllVendors = document.querySelector(".js-show-all-vendors");
const showAllReleases = document.querySelector(".js-show-all-releases");
const showLessVendors = document.querySelector(".js-show-less-vendors");
const showLessReleases = document.querySelector(".js-show-less-releases");
const tabBtn2 = document.querySelector("#tab2");
const tabBtn3 = document.querySelector("#tab3");

const showExpandedVendorFilterOptions = document.querySelector(
  ".js-show-expanded-vendor-filter-options",
);
const showExpandedReleaseFilterOptions = document.querySelector(
  ".js-show-expanded-release-filter-options",
);

// Hide more/less links when tabs are collapsed
tabBtn2.addEventListener("click", (e) => {
  if (tabBtn2.ariaExpanded === "true") {
    showExpandedVendorFilterOptions.classList.add("u-hide");
  } else {
    showExpandedVendorFilterOptions.classList.remove("u-hide");
  }
});

tabBtn3.addEventListener("click", (e) => {
  if (tabBtn3.ariaExpanded === "true") {
    showExpandedReleaseFilterOptions.classList.add("u-hide");
  } else {
    showExpandedReleaseFilterOptions.classList.remove("u-hide");
  }
});

// Set global filter limit for vendors and releases
let filterLimit = 5;

let filterNavigateTimer = null;

const SCROLL_POSITION_KEY = "certifiedFiltersScrollY";

// Filter changes reload the page, which otherwise resets the scroll position
// to the top. Stash it before navigating away; an early inline script in
// base.html restores it as soon as the new page starts loading.
function saveScrollPosition() {
  sessionStorage.setItem(SCROLL_POSITION_KEY, window.scrollY);
}

// certified_home() falls back to the certified homepage when a request has
// neither `q` nor `category`. Keep an empty `q` so filter changes never
// bounce the user off the search results view.
function searchResultsUrl(href) {
  const url = new URL(href);
  if (!url.searchParams.has("q") && !url.searchParams.has("category")) {
    url.searchParams.set("q", "");
  }
  return url.toString();
}

function scheduleFilterNavigation() {
  clearTimeout(filterNavigateTimer);
  filterNavigateTimer = setTimeout(() => {
    saveScrollPosition();
    window.location.assign(searchResultsUrl(window.location.href));
  }, 300);
}

function loadFilters() {
  const { category, vendor, release } = retrieveSelectedFilters();
  renderFilters(category, vendor, release);
}

/**
 *
 * @returns {object} current state of filters in a flat object
 *
 * This function is used as state management
 * It provides the current state of all filters (category, vendor and release)
 */
function retrieveSelectedFilters() {
  const url = new URL(window.location.href);
  const urlParams = new URLSearchParams(url.search);

  return {
    category: urlParams.getAll("category"),
    vendor: urlParams.getAll("vendor"),
    release: urlParams.getAll("release"),
  };
}

function toggleFilterExpandLinks(data, total, elementMore, elementLess) {
  if (data.length < total) {
    // Not surpassing length so hide all
    elementMore.classList.remove("u-hide");
    elementLess.classList.add("u-hide");
    return;
  } else {
    elementMore.classList.add("u-hide");
    elementLess.classList.remove("u-hide");
  }

  if (data.length <= filterLimit) {
    elementMore.classList.add("u-hide");
    elementLess.classList.add("u-hide");
  }
}

async function renderFilters(
  categories,
  vendors,
  releases,
  vendorLimit,
  releaseLimit,
  renderVendorFilters = true,
  renderReleaseFilters = true,
) {
  const filters = await fetchFilters(
    categories,
    vendors,
    releases,
    vendorLimit,
    releaseLimit,
  );
  if (categories && categories.length > 0) {
    if (renderVendorFilters && filters.vendor_filters) {
      filters2Elm.innerHTML = "";
      filters.vendor_filters.data.forEach((item) => {
        renderCheckboxes(item, "vendor", filters2Elm);
      });
      // Show and hide links not needed
      toggleFilterExpandLinks(
        filters.vendor_filters.data,
        filters.vendor_filters.total,
        showAllVendors,
        showLessVendors,
      );
    }

    if (renderReleaseFilters && filters.release_filters) {
      filters3Elm.innerHTML = "";
      filters.release_filters.data.forEach((item) => {
        renderCheckboxes(item, "release", filters3Elm);
      });
      // Show and hide links not needed
      toggleFilterExpandLinks(
        filters.release_filters.data,
        filters.release_filters.total,
        showAllReleases,
        showLessReleases,
      );
    }
  } else {
    if (renderVendorFilters && filters.vendor_filters) {
      filters2Elm.innerHTML = "";
      filters.vendor_filters.data.forEach((item) => {
        renderCheckboxes(item, "vendor", filters2Elm);
      });
      // Show and hide links not needed
      toggleFilterExpandLinks(
        filters.vendor_filters.data,
        filters.vendor_filters.total,
        showAllVendors,
        showLessVendors,
      );
    }

    if (renderReleaseFilters && filters.release_filters) {
      filters3Elm.innerHTML = "";
      filters.release_filters.data.forEach((item) => {
        renderCheckboxes(item, "release", filters3Elm);
      });
      // Show and hide links not needed
      toggleFilterExpandLinks(
        filters.release_filters.data,
        filters.release_filters.total,
        showAllReleases,
        showLessReleases,
      );
    }
  }
}

function renderCheckboxes(value, name, parentElement) {
  const label = document.createElement("label");
  const input = document.createElement("input");
  const span = document.createElement("span");
  let urlParams = new URLSearchParams(window.location.search);
  label.className = "p-checkbox";
  input.type = "checkbox";
  input.name = name;
  input.className = "p-checkbox__input";
  input.value = value;
  input.addEventListener("click", handleFilterClick);

  if (name === "vendor") {
    const vendorParams = urlParams.getAll("vendor");
    if (vendorParams && vendorParams.includes(value)) {
      input.checked = true;
    }
  }

  if (name === "release") {
    const releaseParams = urlParams.getAll("release");
    if (releaseParams && releaseParams.includes(value)) {
      input.checked = true;
    }
  }

  span.className = "p-checkbox__label";
  span.innerHTML = value;
  span.id = value.replace(" ", "-");
  label.appendChild(input);
  label.appendChild(span);
  parentElement.appendChild(label);
}

/**
 *
 * @param {array} category
 * @returns json
 */
async function fetchFilters(
  categoriesList = [],
  selectedVendors = [],
  selectedReleases = [],
  vendorLimit = filterLimit,
  releaseLimit = filterLimit,
) {
  let url = new URL(`${window.location.origin}/certified/filters.json`);
  if (categoriesList.length > 0) {
    categoriesList.forEach((cat) => {
      url.searchParams.append("category", cat);
    });
  }
  if (selectedVendors.length > 0) {
    selectedVendors.forEach((cat) => {
      url.searchParams.append("vendor", cat);
    });
  }

  if (selectedReleases.length > 0) {
    selectedReleases.forEach((cat) => {
      url.searchParams.append("release", cat);
    });
  }

  url.searchParams.append("vendors_limit", vendorLimit);
  url.searchParams.append("releases_limit", releaseLimit);

  return await fetch(url).then((res) => res.json());
}

function handleFilterClick(e) {
  const { value, name, checked, dataset } = e.target;
  let url = new URL(window.location.href);
  let urlParams = url.searchParams;
  const vendorParams = urlParams.getAll("vendor");
  const releasesParams = urlParams.getAll("release");
  const categoryParams = urlParams.getAll("category");

  if (name === "category") {
    if (categoryParams.includes(value)) {
      urlParams.delete(name);
      // Append back deleted params
      // If multiple selected
      if (categoryParams.length > 1) {
        categoryParams.forEach((param) => {
          if (param !== value) {
            urlParams.append(name, param);
          }
        });
      }
    } else {
      urlParams.append(name, value);
    }
  }

  if (name === "vendor") {
    if (vendorParams.includes(value)) {
      urlParams.delete(name);
      if (vendorParams.length > 1) {
        // Append back deleted params
        vendorParams.forEach((param) => {
          if (param !== value) {
            urlParams.append(name, param);
          }
        });
      }
    } else {
      urlParams.append(name, value);
    }
  }

  if (name === "release") {
    if (releasesParams.includes(value)) {
      urlParams.delete(name);
      if (releasesParams.length > 1) {
        // Append back deleted params
        releasesParams.forEach((param) => {
          if (param !== value) {
            urlParams.append(name, param);
          }
        });
      }
    } else {
      urlParams.append(name, value);
    }
  }

  const newURL = `${window.location.pathname}?${urlParams.toString()}`;
  window.history.pushState({ path: newURL }, "", newURL);
  scheduleFilterNavigation();
}

/**
 *
 * @param {Event} e JS event
 * @param {Element} element context, which contains the DOM element
 * the value true/false of the button element represents show/hide
 */
function toggleExpandFilters(e, element) {
  e.preventDefault();
  const { name, value } = element;
  const { category, vendor, release } = retrieveSelectedFilters();

  setFilterLinkLoading(element, true);
  let request;

  if (name === "vendor") {
    if (value === "true") {
      // Show all
      request = renderFilters(
        category,
        vendor,
        release,
        -1,
        filterLimit,
        true,
        false,
      );
    } else {
      // Show default filterLimit
      request = renderFilters(
        category,
        vendor,
        release,
        filterLimit,
        filterLimit,
        true,
        false,
      );
    }
  } else if (name === "release") {
    if (value === "true") {
      // Show all
      request = renderFilters(
        category,
        vendor,
        release,
        filterLimit,
        -1,
        false,
        true,
      );
    } else {
      // Show default filterLimit
      request = renderFilters(
        category,
        vendor,
        release,
        filterLimit,
        filterLimit,
        false,
        true,
      );
    }
  }

  request.finally(() => setFilterLinkLoading(element, false));
}

// /certified/filters.json can take a couple of seconds; without this the
// "Show all" link looks unresponsive until the list suddenly appears.
function setFilterLinkLoading(button, isLoading) {
  if (isLoading) {
    button.dataset.originalText = button.textContent;
    button.disabled = true;
    button.innerHTML =
      '<i class="p-icon--spinner u-animation--spin"></i> ' + button.textContent;
  } else {
    button.disabled = false;
    button.textContent = button.dataset.originalText;
  }
}

function clearFilters() {
  filters1Elm
    .querySelectorAll("input")
    .forEach((item) => (item.checked = false));
  filters2Elm
    .querySelectorAll("input")
    .forEach((item) => (item.checked = false));
  filters3Elm
    .querySelectorAll("input")
    .forEach((item) => (item.checked = false));

  let objUrl = new URL(window.location);
  const { href } = window.location;
  if (href.includes("q=") && !href.includes("q=&")) {
    const startOfQuery = href.indexOf("q");
    const endOfQuery = href.indexOf("&");
    const searchQuery = href.substring(startOfQuery, endOfQuery);
    objUrl.search = searchQuery;
  } else {
    objUrl.search = "";
  }
  saveScrollPosition();
  window.location.assign(objUrl.toString());
}

// function to ensure only the option which has been changed is appended to the URL
function updateResultsPerPage() {
  const searchResults = document.querySelector(".js-search-results");
  const pageSizeTop = document.getElementById("page-size-top");
  const pageSizeBottom = document.getElementById("page-size-bottom");

  if (pageSizeTop) {
    pageSizeTop.addEventListener("change", (e) => {
      // Needs to be set because the other dropdown is a placeholder
      searchResults.submit();
    });
  }

  if (pageSizeBottom) {
    pageSizeBottom.addEventListener("change", (e) => {
      // Avoids submitting 2 redundant fields
      const pageSizeTopChange = new Event("change");
      pageSizeTop.value = e.target.value;
      pageSizeTop.dispatchEvent(pageSizeTopChange);
    });
  }
}

function hideDrawerPageReload() {
  if (window.location.href.includes("drawer")) {
    const closeDrawerButton = document.querySelector("#toggle-filters");
    closeDrawerButton.click();
  }
}

// Bind the statically-rendered filter controls (category checkboxes, the
// vendor/release show-all / show-less toggles, and the apply / clear buttons)
// that previously used inline on* handlers, now disallowed under our CSP.
function wireStaticFilterHandlers() {
  if (filters1Elm) {
    filters1Elm.querySelectorAll("input").forEach((input) => {
      input.addEventListener("click", handleFilterClick);
    });
  }

  [showAllVendors, showLessVendors, showAllReleases, showLessReleases].forEach(
    (button) => {
      if (button) {
        button.addEventListener("click", (e) => {
          toggleExpandFilters(e, button);
        });
      }
    },
  );

  const clearFiltersButton = document.querySelector(".js-clear-filters");
  if (clearFiltersButton) {
    clearFiltersButton.addEventListener("click", clearFilters);
  }
}

// Vendor/release options are now server-rendered; only fetch them if
// they're missing, and bind clicks to the ones already on the page.
if (filters2Elm.querySelector("input") || filters3Elm.querySelector("input")) {
  [filters2Elm, filters3Elm].forEach((section) => {
    section.querySelectorAll("input").forEach((input) => {
      input.addEventListener("click", handleFilterClick);
    });
  });
} else {
  loadFilters();
}
updateResultsPerPage();
hideDrawerPageReload();
wireStaticFilterHandlers();
