const releaseFilter = document.querySelector("#release-filter");
const releaseCheckboxes = releaseFilter
  ? releaseFilter.querySelectorAll(".p-checkbox__input")
  : null;
const applyFiltersButton = document.querySelector("#apply-filters");
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
  const clearFiltersButton = document.querySelector("#clear-filters");
  const unmaintainedReleasesContainer = document.querySelector(
    ".js-unmaintained-releases",
  );
var form = document.querySelector(".js-form");
var orderInput = document.querySelector(".js-order-input");
var orderSelect = document.querySelector(".js-order-select");
var details = document.querySelector(".js-details");
var release = document.querySelector(".js-release");
var submit = document.querySelector(".js-submit");
const unmaintainedReleasesLink = document.querySelector(
    ".js-show-unmaintained-releases",
  );

// Submit form on order select change
if (orderSelect != null) {
    orderSelect.onchange = function(event) {
    orderInput.value = event.target.value;
    form.submit();
    }
}

// Disable search when form is empty
// function toogleSearch() {
//     submit.disabled = !details.value && !release.value;
// }

// Toggle on form change
// form.onchange = function() {
//     toogleSearch();
// }

// Toggle on details input keyup
// details.onkeyup = function() {
//     toogleSearch();
// }

// Toggle on page load
// toogleSearch();

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
  handleFilters();

// Removes a parameter from URLSearchParams object
function removeParam(param, value) {
    if (value === "maintained") {
      maintainedReleases.forEach(function (release) {
        const checkbox = getCheckboxFromRelease(release);
        checkbox.checked = false;
        urlParams.delete(param, release);
      });
    } else if (value === "vulnerable") {
      vulnerableStatuses.forEach(function (status) {
        urlParams.delete(param, status);
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

  function applyFilters() {
    if (applyFiltersButton) {
      applyFiltersButton.addEventListener("click", function (event) {
        url.search = urlParams.toString();
        window.location.href = url.href;
      });
    }
  }
  applyFilters();

  let includesFilterSubset = (parentArray, subsetArray) => {
  return subsetArray.every((el) => {
    return parentArray.includes(el);
  });
};

function showUnmaintainedReleases() {
    if (unmaintainedReleasesLink) {
      unmaintainedReleasesLink.onclick = function (event) {
        console.log("clicked")
        event.preventDefault();
        unmaintainedReleasesLink.classList.add("u-hide");
        unmaintainedReleasesContainer.classList.remove("u-hide");
      };
    }
  }
  showUnmaintainedReleases();

// Maintains filter state on page load
function handleFilterPersist() {
  if (urlParams.has("version")) {
    const params = urlParams.getAll("version");

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

function handleClearFilters() {
    if (clearFiltersButton) {
      clearFiltersButton.addEventListener("click", function (event) {
        let keys = [...urlParams.keys()];
        keys.forEach((key) => {
          urlParams.delete(key);
        });
        // Always leave this empty param on clear
        // so the user is not redirected to the landing page
        urlParams.set("q", "");
  
        url.search = urlParams.toString();
        window.location.href = url.href;
      });
    }
  }
  handleClearFilters();


  function getCheckboxFromRelease(release) {
    const releaseCheckboxesArray = Array.from(releaseCheckboxes);
    const checkbox = releaseCheckboxesArray.find(
      (checkbox) => checkbox.value === release,
    );
  
    return checkbox;
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
  showUnmaintainedReleases();