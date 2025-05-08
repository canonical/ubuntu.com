const url = new URL(window.location.href);
const urlParams = new URLSearchParams(url.search);
const releaseFilter = document.querySelector("#release-filter");
const releaseCheckboxes = releaseFilter
  ? releaseFilter.querySelectorAll(".p-checkbox__input")
  : null;
const applyFiltersButton = document.querySelector("#apply-filters");
const clearFiltersButton = document.querySelector("#clear-filters");
const unmaintainedReleasesContainer = document.querySelector(
  ".js-unmaintained-releases",
);
const form = document.querySelector(".js-notice-form");
const orderInput = document.querySelector(".js-order-input");
const details = document.querySelector(".js-details");
const release = document.querySelector(".js-release");
const submit = document.querySelector(".js-submit");
const unmaintainedReleasesLink = document.querySelector(
  ".js-show-unmaintained-releases",
);
const searchClose = form.querySelector(".p-icon--close");
const searchInput = form.querySelector(".p-search-box__input");

// External data
// eslint-disable-next-line no-undef
const maintainedReleases = Object.values(maintainedReleasesObj).map(
  (release) => release.codename,
);
// eslint-disable-next-line no-undef
const ltsReleases = Object.values(ltsReleasesObj).map(
  (release) => release.codename,
);
// eslint-disable-next-line no-undef
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

// Disable search when form is empty
function toogleSearch() {
  submit.disabled = !details.value;
}

// Event handlers

function handleFormReset() {
  searchClose.addEventListener("click", function (event) {
    event.preventDefault();
    searchInput.value = "";
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

// Toggle on form change
form.onchange = function () {
  toogleSearch();
};

// Toggle on details input keyup
details.onkeyup = function () {
  toogleSearch();
};

function handleClearFilters() {
  if (clearFiltersButton) {
    clearFiltersButton.addEventListener("click", function (event) {
      let keys = [...urlParams.keys()];
      keys.forEach((key) => {
        if (key == "release") {
          urlParams.delete(key);
        }
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
      checkbox.addEventListener("change", function (event) {
        if (event.target.checked) {
          addParam(releaseFilter.name, event.target.value);
        } else {
          removeParam(releaseFilter.name, event.target.value);
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
      const maintainedCheckbox = document.querySelector(
        "input[type='checkbox'][value='maintained']",
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
      let maintainedCheckbox = releaseFilter.querySelector(
        "input[value='maintained']",
      );
      maintainedCheckbox.checked = true;
    }
  }
}

document.addEventListener("DOMContentLoaded", function () {
  handleFormReset();
  toogleSearch();
  showUnmaintainedReleases();
  applyFilters();
  handleClearFilters();
  handleFilterPersist();
  handleFilters();
  showUnmaintainedReleases();
});
