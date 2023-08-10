/* eslint-disable @typescript-eslint/no-unused-vars */

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

// Hide more/less links when tabs are collapsed
tabBtn2.addEventListener("click", (e) => {
  if (tabBtn2.ariaExpanded === "true") {
    showAllVendors.classList.add("u-hide");
    showLessVendors.classList.add("u-hide");
  }

  if (tabBtn3.ariaExpanded === "true") {
    showAllReleases.classList.add("u-hide");
    showLessReleases.classList.add("u-hide");
  }
});

// Set global filter limit for vendors and releases
let filterLimit = 5;

function loadFilters() {
  const { category, vendor, release } = retrieveSelectedFilters();
  renderFilters(category, vendor, release);
}

/**
 *
 * @returns {object} current state of filters in a flat object
 *
 * This function is used as state management
 * It provides the current state of all filters (category, vendor and ralease)
 */
function retrieveSelectedFilters() {
  const url = new URL(window.location.href);
  const urlParams = new URLSearchParams(url.search);
  const path = window.location.pathname;
  const pathCategory = path.replace("/certified/", "");

  let selectedCategories;
  let selectedVendors = urlParams.getAll("vendor");
  let selectedReleases = urlParams.getAll("release");

  if (pathCategory !== "/certified") {
    selectedCategories = urlParams.getAll("category").push(pathCategory);
  } else {
    selectedCategories = urlParams.getAll("category");
  }

  return {
    category: selectedCategories,
    vendor: selectedVendors,
    release: selectedReleases,
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
  renderReleaseFilters = true
) {
  const filters = await fetchFilters(
    categories,
    vendors,
    releases,
    vendorLimit,
    releaseLimit
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
        showLessVendors
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
        showLessReleases
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
        showLessVendors
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
        showLessReleases
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
  releaseLimit = filterLimit
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

async function handleCategoryClick(e) {
  // Reset every time category is clicked
  filters2Elm.innerHTML = "";
  filters3Elm.innerHTML = "";

  handleFilterClick(e);
  const url = new URL(window.location.href);
  const newURLParams = new URLSearchParams(url.search);
  if (newURLParams.getAll("category").length === 0) {
    renderFilters([]);
  } else {
    const checkbox = filters1Elm.querySelectorAll("input");
    let categories = [];
    checkbox.forEach((box) => {
      if (box.checked) {
        categories.push(box.dataset.filter);
      }
    });
    renderFilters(categories);
  }
}

function handleFilterClick(e) {
  const { value, name, checked, dataset, id } = e;
  let url = new URL(window.location.href);
  let urlParams = url.searchParams;
  const vendorParams = urlParams.getAll("vendor");
  const releasesParams = urlParams.getAll("release");
  const categoryParams = urlParams.getAll("category");
  const pathCategory = window.location.pathname.replace("/certified/", "");

  if (name === "category") {
    if (categoryParams.includes(value) || pathCategory === id) {
      urlParams.delete(name);
      // Only category pages
      if (pathCategory === id) {
        const newURL = `/certified?${urlParams.toString()}`;
        window.history.pushState({ path: newURL }, "", newURL);
      }
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
}

function submitFilters() {
  window.location.replace(window.location.href);
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
  if (name === "vendor") {
    if (value === "true") {
      // Show all
      renderFilters(category, vendor, release, -1, filterLimit, true, false);
    } else {
      // Show default filterLimit
      renderFilters(
        category,
        vendor,
        release,
        filterLimit,
        filterLimit,
        true,
        false
      );
    }
  } else if (name === "release") {
    if (value === "true") {
      // Show all
      renderFilters(category, vendor, release, filterLimit, -1, false, true);
    } else {
      // Show default filterLimit
      renderFilters(
        category,
        vendor,
        release,
        filterLimit,
        filterLimit,
        false,
        true
      );
    }
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
  window.history.pushState({ url: objUrl }, "", objUrl);
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

loadFilters();
updateResultsPerPage();
hideDrawerPageReload();
