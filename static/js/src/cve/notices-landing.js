const url = new URL(window.location.href);
const urlParams = new URLSearchParams(url.search);
const releaseFilter = /** @type {HTMLFormElement} */ (
  document.querySelector("#release-filter")
);
const releaseCheckboxes = /** @type {NodeListOf<HTMLInputElement>} */ (
  releaseFilter.querySelectorAll("input.p-checkbox__input")
);
const applyFiltersButton = /** @type {HTMLButtonElement} */ (
  document.querySelector("#apply-filters")
);
const clearFiltersButton = /** @type {HTMLButtonElement} */ (
  document.querySelector("#clear-filters")
);
const unmaintainedReleasesContainer = /** @type {HTMLElement} */ (
  document.querySelector(".js-unmaintained-releases")
);
const form = /** @type {HTMLFormElement} */ (
  document.querySelector(".js-notice-form")
);
const orderInput = document.querySelector(".js-order-input");
const details = document.querySelector(".js-details");
const release = document.querySelector(".js-release");
const submit = /** @type {HTMLButtonElement} */ (
  document.querySelector(".js-submit")
);
const unmaintainedReleasesLink = /** @type {HTMLAnchorElement} */ (
  document.querySelector(".js-show-unmaintained-releases")
);
const searchClose = /** @type {HTMLButtonElement} */ (
  form.querySelector(".p-icon--close")
);
const searchInput = /** @type {HTMLInputElement} */ (
  form.querySelector(".p-search-box__input")
);
const noticesListSection = document.querySelector("#notices-list");

// External data
const maintainedReleases = Object.values(maintainedReleasesObj).map(
  (release) => release.codename,
);
const ltsReleases = Object.values(ltsReleasesObj).map(
  (release) => release.codename,
);
const unmaintainedReleases = Object.values(unmaintainedReleasesObj).map(
  (release) => release.codename,
);

// Utility Functions

function getCheckboxFromRelease(release) {
  const releaseCheckboxesArray = Array.from(releaseCheckboxes);
  const checkbox = releaseCheckboxesArray.find(
    (checkbox) => checkbox.value === release,
  );

  return checkbox;
}

let includesFilterSubset = (parentArray, subsetArray) => {
  return subsetArray.every((el) => {
    return parentArray.includes(el);
  });
};

function scrollToList() {
  // if releases exists in the URL scroll to this section
  if (urlParams.has("release")) {
    noticesListSection.scrollIntoView();
  }
}

// Event handlers
function handleFormSubmit() {
  submit.addEventListener("click", function (event) {
    event.preventDefault();

    if (searchInput.value) {
      urlParams.set("details", searchInput.value);
    } else if (urlParams.has("details")) {
      urlParams.delete("details");
    }

    url.search = urlParams.toString();
    window.location.href = url.href;
  });
}

function handleFormReset() {
  searchClose.addEventListener("click", function (event) {
    event.preventDefault();
    const preValue = searchInput.value;
    searchInput.value = "";
    // Remove param from url is search box is cleared
    if (urlParams.get("details")) {
      urlParams.delete("details");
      url.search = urlParams.toString();
      window.location.href = url.href;
    }
  });
}

function applyFilters() {
  if (applyFiltersButton) {
    applyFiltersButton.addEventListener("click", function (event) {
      url.search = urlParams.toString();
      window.location.href = url.href;
    });
  }
}

function handleClearFilters() {
  if (clearFiltersButton) {
    clearFiltersButton.addEventListener("click", function (event) {
      const keys = new Set();
      urlParams.forEach((value, key) => {
        if (key === "release") keys.add(key);
      });
      keys.forEach((key) => {
        urlParams.delete(key);
      });

      url.search = urlParams.toString();
      window.location.href = url.href;
    });
  }
}

function showUnmaintainedReleases() {
  if (unmaintainedReleasesLink) {
    unmaintainedReleasesLink.onclick = function (event) {
      event.preventDefault();
      unmaintainedReleasesLink.classList.add("u-hide");
      unmaintainedReleasesContainer.classList.remove("u-hide");
    };
  }
}

// Adds event listeners to all filter checkboxes
function handleFilters() {
  if (releaseCheckboxes) {
    releaseCheckboxes.forEach(function (checkbox) {
      checkbox.addEventListener("change", function () {
        if (checkbox.checked) {
          addParam(releaseFilter.name, checkbox.value);
        } else {
          removeParam(releaseFilter.name, checkbox.value);
        }
      });
    });
  }
}

//Filter functionality

// Maintained releases are handled differently
// because it's an arrays of params instead of individual values.
function addParam(param, value) {
  if (value === "maintained") {
    maintainedReleases.forEach(function (release) {
      const checkbox = getCheckboxFromRelease(release);
      checkbox.checked = true;
      urlParams.append(param, release);
    });
  } else {
    if (!urlParams.has(param, value)) {
      urlParams.append(param, value);
    }
  }
}

function removeParam(param, value) {
  if (value === "maintained") {
    maintainedReleases.forEach(function (release) {
      const checkbox = getCheckboxFromRelease(release);
      checkbox.checked = false;
      urlParams.delete(param, release);
    });
  } else {
    if (maintainedReleases.includes(value)) {
      const maintainedCheckbox = /** @type {HTMLInputElement} */ (
        document.querySelector("input[type='checkbox'][value='maintained']")
      );
      maintainedCheckbox.checked = false;
    }
    urlParams.delete(param, value);
  }
}

function handleFilterPersist() {
  if (urlParams.has("release")) {
    const params = urlParams.getAll("release");

    if (releaseCheckboxes) {
      releaseCheckboxes.forEach(function (checkbox) {
        if (params.includes(checkbox.value)) {
          checkbox.checked = true;
        }
      });
    }

    if (includesFilterSubset(params, maintainedReleases)) {
      let maintainedCheckbox = /** @type {HTMLInputElement} */ (
        releaseFilter.querySelector("input[value='maintained']")
      );
      maintainedCheckbox.checked = true;
    }
  }
}

document.addEventListener("DOMContentLoaded", function () {
  handleFormReset();
  handleFormSubmit();
  showUnmaintainedReleases();
  applyFilters();
  handleClearFilters();
  handleFilterPersist();
  handleFilters();
  showUnmaintainedReleases();
  scrollToList();
});
