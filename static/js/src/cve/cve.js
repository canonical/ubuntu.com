import { isValidCveId, disableField, enableField } from "./cve-search.js";

const searchInput = document.querySelector("#q");

function handleCveIdInput(value) {
  const packageInput = document.querySelector("#package");
  const priorityInput = document.querySelector("#priority");
  const componentInput = document.querySelector("#component");
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
  } else {
    enableField(packageInput);
    enableField(priorityInput);
    enableField(componentInput);

    searchButtonText.classList.remove("u-hide");
    searchButtonValidCveText.classList.add("u-hide");
  }
}

handleCveIdInput(searchInput.value);

function handleSearchInput(event) {
  handleCveIdInput(event.target.value);
}

searchInput.addEventListener("keyup", handleSearchInput);
