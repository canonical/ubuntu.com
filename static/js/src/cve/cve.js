import {
  isValidCveId,
  disableField,
  enableField,
  constructCveId,
} from "./cve-search.js";

const searchInput = document.querySelector("#q");

function handleCveIdInput(value) {
  const packageInput = document.querySelector("#package");
  const priorityInput = document.querySelector("#priority");
  const searchButton = document.querySelector("#cve-search-button");
  const redirectButton = document.querySelector("#cve-redirect-button");

  if (isValidCveId(value)) {
    const cveId = constructCveId(value);

    redirectButton.setAttribute("href", `/security/${cveId}`);

    redirectButton.classList.remove("u-hide");
    searchButton.classList.add("u-hide");

    disableField(packageInput);
    disableField(priorityInput);
  } else {
    enableField(packageInput);
    enableField(priorityInput);

    searchButton.classList.remove("u-hide");
    redirectButton.classList.add("u-hide");
  }
}

handleCveIdInput(searchInput.value);

function handleSearchInput(event) {
  handleCveIdInput(event.target.value);
}

searchInput.addEventListener("keyup", handleSearchInput);
