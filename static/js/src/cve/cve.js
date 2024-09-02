import {
  isValidCveId,
  disableField,
  enableField,
  attachEvents,
  handleButtons,
  disableSelectedVersions,
} from "./cve-search.js";

const searchInput = document.querySelector("#q");
const searchForm = document.querySelector("#searchForm");
const url = new URL(window.location.href);
const urlParams = new URLSearchParams(url.search);
const limitSelect = document.querySelector(".js-limit-select");
const orderSelect = document.querySelector(".js-order-select");
const exportLink = document.querySelector("#js-export-link");
const apiBase = "https://ubuntu.com/security/cves.json";
const releaseFilter = document.querySelector("#release-filter");
const priorityFilter = document.querySelector("#priority-filter");
const statusFilter = document.querySelector("#status-filter");
const clearFiltersButton = document.querySelector("#clear-filters");
const vulnerableStatuses = ["pending", "needed", "deferred"];
const releaseCheckboxes = releaseFilter.querySelectorAll(".p-checkbox__input");
const applyFiltersButton = document.querySelector("#apply-filters");
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
const maintainedReleases = Object.values(maintainedReleasesObj).map(
  (release) => release.codename
);
const ltsReleases = Object.values(ltsReleasesObj).map(
  (release) => release.codename
);
const unmaintainedReleases = Object.values(unmaintainedReleasesObj).map(
  (release) => release.codename
);
let filterParams = [];

function handleCveIdInput(value) {
  const packageInput = document.querySelector("#package");
  const priorityInput = document.querySelector("#priority");
  const componentInput = document.querySelector("#component");
  const statusInputs = document.querySelectorAll(".js-status-input");
  const ubuntuVersionInputs = document.querySelectorAll(
    ".js-ubuntu-version-input",
  );
  const addRowButtons = document.querySelectorAll(".js-add-row");
  const removeRowButtons = document.querySelectorAll(".js-remove-row");
  const searchButtonText = document.querySelector(".cve-search-text");
  const searchButtonValidCveText = document.querySelector(
    ".cve-search-valid-cve-text",
  );

  if (isValidCveId(value)) {
    searchButtonValidCveText.classList.remove("u-hide");
    searchButtonText.classList.add("u-hide");

    disableField(packageInput);
    disableField(priorityInput);
    disableField(componentInput);

    statusInputs.forEach((statusInput) => disableField(statusInput));
    ubuntuVersionInputs.forEach((ubuntuVersionInput) =>
      disableField(ubuntuVersionInput),
    );
    addRowButtons.forEach((addRowButton) => disableField(addRowButton));
    removeRowButtons.forEach((removeRowButton) =>
      disableField(removeRowButton),
    );
  } else {
    enableField(packageInput);
    enableField(priorityInput);
    enableField(componentInput);

    statusInputs.forEach((statusInput) => enableField(statusInput));
    ubuntuVersionInputs.forEach((ubuntuVersionInput) =>
      enableField(ubuntuVersionInput),
    );
    removeRowButtons.forEach((removeRowButton, index) => {
      if (index > 0) {
        enableField(removeRowButton);
      }
    });

    searchButtonText.classList.remove("u-hide");
    searchButtonValidCveText.classList.add("u-hide");
  }
}

handleCveIdInput(searchInput.value);

function handleSearchInput(event) {
  if (event.key === "Enter") {
    searchForm.submit();
  } else {
    handleCveIdInput(event.target.value);
  }
}

searchInput.addEventListener("keyup", handleSearchInput);

attachEvents();
handleButtons();
disableSelectedVersions();

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
      console.log(event.target.value, priorityFilter);
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

// Removes a parameter from the filterParams array
function removeParam(param, value) {
  if (param === "version") {
    let statusIndex = filterParams
      .map((param) => param.param)
      .indexOf("status");
    filterParams.splice(statusIndex, 1);
  }
  filterParams = filterParams.filter((param) => param.value !== value);
}

// Maintains filter state on page load
// Vulnerable filter is handled differently because it is a single value
function handleFilterPersist() {
  if (urlParams.has("version")) {
    const params = urlParams.getAll("version");

    releaseCheckboxes.forEach(function (checkbox) {
      if (params.includes(checkbox.value)) {
        checkbox.checked = true;
      }
    });
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
}
handleFilterPersist();

function applyFilters() {
  applyFiltersButton.addEventListener("click", function (event) {
    filterParams.forEach(function (param) {
      urlParams.append(param.param, param.value);
    });
    url.search = urlParams.toString();
    window.location.href = url.href;
  });
}
applyFilters();

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

// Maintained releases and vulnerable statuses are handled differently
// because they are both arrays instead of individual values
function addParam(param, value) {
  if (value === "maintained") {
    maintainedReleases.forEach(function (release) {
      filterParams.push(
        { param: param, value: release },
        { param: "status", value: "" }
      );
    });
  } else if (param === "version") {
    filterParams.push(
      { param: param, value: value },
      { param: "status", value: "" }
    );
  } else if (value === "vulnerable") {
    vulnerableStatuses.forEach(function (status) {
      filterParams.push({ param: param, value: status });
    });
  } else {
    filterParams.push({ param: param, value: value });
  }
}

function showUnmaintaiedReleases() {
  unmaintainedReleasesLink.onclick = function (event) {
    event.preventDefault();
    unmaintainedReleasesLink.classList.add("u-hide");
    unmaintainedReleasesContainer.classList.remove("u-hide");
  };
}
showUnmaintaiedReleases();

function handleLimitSelect() {
  if (urlParams.has("limit")) {
    limitSelect.value = urlParams.get("limit");
  }

  limitSelect.onchange = function (event) {
    limitSelect.value = event.target.value;
    urlParams.set("limit", limitSelect.value);
    url.search = urlParams.toString();
    window.location.href = url.href;
  };
}
handleLimitSelect();

function handleOrderSelect() {
  if (urlParams.has("order")) {
    orderSelect.value = urlParams.get("order");
  }

  orderSelect.onchange = function (event) {
    orderSelect.value = event.target.value;
    urlParams.set("order", orderSelect.value);
    url.search = urlParams.toString();
    window.location.href = url.href;
  };
}
handleOrderSelect();

function exportToJSON() {
  exportLink.onclick = function (event) {
    event.preventDefault();
    let apiURL = new URL(url.search, apiBase);
    window.location.href = apiURL.href;
  };
}
exportToJSON();
