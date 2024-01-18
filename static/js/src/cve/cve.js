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

function handleCveIdInput(value) {
  const packageInput = document.querySelector("#package");
  const priorityInput = document.querySelector("#priority");
  const componentInput = document.querySelector("#component");
  const statusInputs = document.querySelectorAll(".js-status-input");
  const ubuntuVersionInputs = document.querySelectorAll(
    ".js-ubuntu-version-input"
  );
  const addRowButtons = document.querySelectorAll(".js-add-row");
  const removeRowButtons = document.querySelectorAll(".js-remove-row");
  const searchButtonText = document.querySelector(".cve-search-text");
  const searchButtonValidCveText = document.querySelector(
    ".cve-search-valid-cve-text"
  );

  if (isValidCveId(value)) {
    searchButtonValidCveText.classList.remove("u-hide");
    searchButtonText.classList.add("u-hide");

    disableField(packageInput);
    disableField(priorityInput);
    disableField(componentInput);

    statusInputs.forEach((statusInput) => disableField(statusInput));
    ubuntuVersionInputs.forEach((ubuntuVersionInput) =>
      disableField(ubuntuVersionInput)
    );
    addRowButtons.forEach((addRowButton) => disableField(addRowButton));
    removeRowButtons.forEach((removeRowButton) =>
      disableField(removeRowButton)
    );
  } else {
    enableField(packageInput);
    enableField(priorityInput);
    enableField(componentInput);

    statusInputs.forEach((statusInput) => enableField(statusInput));
    ubuntuVersionInputs.forEach((ubuntuVersionInput) =>
      enableField(ubuntuVersionInput)
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
