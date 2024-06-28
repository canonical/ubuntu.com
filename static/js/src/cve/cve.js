const searchForm = document.querySelector("#searchForm");
const searchSubmitButton = document.querySelector("#cve-search-button");
const url = new URL(window.location.href);
const urlParams = new URLSearchParams(url.search);
const apiBase = "https://ubuntu.com/security/cves.json";
const limitSelect = document.querySelector(".js-limit-select");
const orderSelect = document.querySelector(".js-order-select");
const exportLink = document.querySelector("#js-export-link");
const releaseFilter = document.querySelector("#release-filter");
const priorityFilter = document.querySelector("#priority-filter");
const statusFilter = document.querySelector("#status-filter");
const clearFiltersButton = document.querySelector("#clear-filters");
const vulnerableStatuses = ["pending", "needed", "deferred"];
const releaseCheckboxes = releaseFilter.querySelectorAll(".p-checkbox__input");
const applyFiltersButton = document.querySelector("#apply-filters");
const packageInput = document.querySelector("#affectedPackages");
const priorityCheckboxes = priorityFilter.querySelectorAll(
  ".p-checkbox__input"
);
const statusCheckboxes = statusFilter.querySelectorAll(".p-checkbox__input");
const unmaintainedReleasesLink = document.querySelector(
  ".js-show-unmaintained-releases"
);
const unmaintainedReleasesContainer = document.querySelector(
  ".js-unmaintained-releases"
);
const showPackagesLinks = document.querySelectorAll(".js-show-packages");
const hidePackagesLinks = document.querySelectorAll(".js-hide-packages");
const detailedSwitch = document.querySelector(".js-detailed-switch");
const detailedTables = document.querySelectorAll(".detailed-table");
const cveDescs = document.querySelectorAll(".cve-desc");
// eslint-disable-next-line no-undef
const maintainedReleases = Object.values(maintainedReleasesObj).map(
  (release) => release.codename
);
// eslint-disable-next-line no-undef
const ltsReleases = Object.values(ltsReleasesObj).map(
  (release) => release.codename
);
// eslint-disable-next-line no-undef
const unmaintainedReleases = Object.values(unmaintainedReleasesObj).map(
  (release) => release.codename
);

function handleSearchInput() {
  const formData = new FormData(searchForm);

  for (const key of formData.values()) {
    urlParams.set("q", key);
  }

  url.search = urlParams.toString();
  window.location.href = url.href;
}

searchSubmitButton.addEventListener("click", function (event) {
  event.preventDefault();
  handleSearchInput();
});

// Adds listener to package filter text field and adds value
// to URLSearchParams object
function handlePackageInput() {
  packageInput.addEventListener("input", function (event) {
    urlParams.set("package", packageInput.value);
  });
}
handlePackageInput();

// Adds event listeners to all filter checkboxes
function handleFilters() {
  releaseCheckboxes.forEach(function (checkbox) {
    checkbox.addEventListener("change", function (event) {
      if (event.target.checked) {
        addParam(releaseFilter.name, event.target.value);
      } else {
        removeParam(releaseFilter.name, event.target.value);
      }
    });
  });

  priorityCheckboxes.forEach(function (checkbox) {
    checkbox.addEventListener("change", function (event) {
      if (event.target.checked) {
        addParam(priorityFilter.name, event.target.value);
      } else {
        removeParam(priorityFilter.name, event.target.value);
      }
    });
  });

  statusCheckboxes.forEach(function (checkbox) {
    checkbox.addEventListener("change", function (event) {
      if (event.target.checked) {
        addParam(statusFilter.name, event.target.value);
      } else {
        removeParam(statusFilter.name, event.target.value);
      }
    });
  });
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
        "input[type='checkbox'][value='maintained']"
      );
      maintainedCheckbox.checked = false;
    }
    urlParams.delete(param, value);
  }
}

function applyFilters() {
  applyFiltersButton.addEventListener("click", function (event) {
    url.search = urlParams.toString();
    window.location.href = url.href;
  });
}
applyFilters();

let includesFilterSubset = (parentArray, subsetArray) => {
  return subsetArray.every((el) => {
    return parentArray.includes(el);
  });
};

// Maintains filter state on page load
function handleFilterPersist() {
  if (urlParams.has("version")) {
    const params = urlParams.getAll("version");

    releaseCheckboxes.forEach(function (checkbox) {
      if (params.includes(checkbox.value)) {
        checkbox.checked = true;
      }
    });

    if (includesFilterSubset(params, maintainedReleases)) {
      let maintainedCheckbox = releaseFilter.querySelector(
        "input[value='maintained']"
      );
      maintainedCheckbox.checked = true;
    }
  }

  if (urlParams.has("priority")) {
    const params = urlParams.getAll("priority");

    priorityCheckboxes.forEach(function (checkbox) {
      if (params.includes(checkbox.value)) {
        checkbox.checked = true;
      }
    });
  }

  if (urlParams.has("status")) {
    const params = urlParams.getAll("status");

    if (params.includes("pending")) {
      const checkbox = statusFilter.querySelector("input[value='vulnerable']");
      checkbox.checked = true;
    } else {
      statusCheckboxes.forEach(function (checkbox) {
        if (params.includes(checkbox.value)) {
          checkbox.checked = true;
        }
      });
    }
  }

  if (urlParams.has("detailed")) {
    detailedSwitch.checked = true;
    handleDetailedViewSwitch({ target: detailedSwitch });
  }
}
handleFilterPersist();

function handleClearFilters() {
  clearFiltersButton.addEventListener("click", function (event) {
    for (const [param] of urlParams.entries()) {
      if (urlParams.has("q")) {
        if (param != "q") {
          urlParams.delete(param);
        }
      } else {
        urlParams.append("q", "");
      }
    }
    url.search = urlParams.toString();
    window.location.href = url.href;
  });
}
handleClearFilters();

// Maintained releases and vulnerable params statuses are handled differently
// because they are both arrays of params instead of individual values.
// Existing params are checked before appending to the URLSearchParams object
// to avoid duplicates
function addParam(param, value) {
  if (value === "maintained") {
    maintainedReleases.forEach(function (release) {
      const checkbox = getCheckboxFromRelease(release);
      checkbox.checked = true;
      urlParams.append(param, release);
    });
  } else if (value === "vulnerable") {
    vulnerableStatuses.forEach(function (status) {
      if (!urlParams.has(param, status)) {
        urlParams.append(param, status);
      }
    });
  } else {
    if (!urlParams.has(param, value)) {
      urlParams.append(param, value);
    }
  }
}

function getCheckboxFromRelease(release) {
  const releaseCheckboxesArray = Array.from(releaseCheckboxes);
  const checkbox = releaseCheckboxesArray.find(
    (checkbox) => checkbox.value === release
  );

  return checkbox;
}

function showUnmaintainedReleases() {
  unmaintainedReleasesLink.onclick = function (event) {
    event.preventDefault();
    unmaintainedReleasesLink.classList.add("u-hide");
    unmaintainedReleasesContainer.classList.remove("u-hide");
  };
}
showUnmaintainedReleases();

function handleLimitSelect() {
  if (urlParams.has("limit")) {
    limitSelect.value = urlParams.get("limit");
  }

  if (limitSelect) {
    limitSelect.onchange = function (event) {
      limitSelect.value = event.target.value;
      urlParams.set("limit", limitSelect.value);
      url.search = urlParams.toString();
      window.location.href = url.href;
    };
  }
}
handleLimitSelect();

function handleOrderSelect() {
  if (urlParams.has("order")) {
    orderSelect.value = urlParams.get("order");
  }

  if (orderSelect) {
    orderSelect.onchange = function (event) {
      orderSelect.value = event.target.value;
      urlParams.set("order", orderSelect.value);
      url.search = urlParams.toString();
      window.location.href = url.href;
    };
  }
}
handleOrderSelect();

function exportToJSON() {
  if (exportLink) {
    exportLink.onclick = function (event) {
      event.preventDefault();
      let apiURL = new URL(url.search, apiBase);
      window.location.href = apiURL.href;
    };
  }
}
exportToJSON();

// Button to handle detailed view of packages
// Adds and removes param to maintain table view state on filter
function handleDetailedViewSwitch(event) {
  if (event.target.checked) {
    detailedTables.forEach((table) => table.classList.remove("u-hide"));
    cveDescs.forEach((desc) => desc.classList.add("u-hide"));
    urlParams.append("detailed", event.target.checked);
  } else {
    detailedTables.forEach((table) => table.classList.add("u-hide"));
    cveDescs.forEach((desc) => desc.classList.remove("u-hide"));
    urlParams.delete("detailed");
  }
}
detailedSwitch.addEventListener("click", handleDetailedViewSwitch);

// Show detailed view of packages
function handleShowDetailedView() {
  showPackagesLinks.forEach((showPackagesLink) => {
    showPackagesLink.onclick = function (event) {
      event.preventDefault();
      const id = showPackagesLink.id.split("--")[1];
      const cveTable = document.querySelector(`#table--${id}`);

      cveTable.querySelectorAll(".blurred-row").forEach((cell) => {
        cell.classList.remove("cve-table-blur");
      });

      cveTable.querySelectorAll(".expandable-row").forEach((row) => {
        row.classList.remove("u-hide");
        showPackagesLink.classList.add("u-hide");
        const hidePackagesLink = document.querySelector(`#hide--${id}`);
        hidePackagesLink.classList.remove("u-hide");
      });
    };
  });
}
handleShowDetailedView();

// Hide detailed view of packages
function handleHideDetailedView() {
  hidePackagesLinks.forEach((hidePackagesLink) => {
    hidePackagesLink.onclick = function (event) {
      event.preventDefault();
      const id = hidePackagesLink.id.split("--")[1];
      const cveTable = document.querySelector(`#table--${id}`);

      cveTable.querySelectorAll(".blurred-row").forEach((cell) => {
        cell.classList.add("cve-table-blur");
      });

      cveTable.querySelectorAll(".expandable-row").forEach((row) => {
        row.classList.add("u-hide");
        hidePackagesLink.classList.add("u-hide");
        const showPackagesLink = document.querySelector(`#show--${id}`);
        showPackagesLink.classList.remove("u-hide");

        const card = document.querySelector(`#card--${id}`);
        card.scrollIntoView({ behavior: "smooth" });
      });
    };
  });
}
handleHideDetailedView();

// On page load, check if the detailed view switch is checked
function handleDetailedView() {
  if (detailedSwitch.checked) {
    handleShowDetailedView();
  } else {
    handleHideDetailedView();
  }
}
handleDetailedView();
