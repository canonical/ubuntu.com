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
  if (event.key === "Enter"){
    searchForm.submit();
  }else{
  handleCveIdInput(event.target.value);
  }
}

searchInput.addEventListener("keyup", handleSearchInput);

attachEvents();
handleButtons();
disableSelectedVersions();

const priorities = {
  critical:
    "<strong>Critical:</strong> A world-burning problem that is exploitable for most Ubuntu users. Examples include remote root privilege escalations or remote data theft.",
  high:
    "<strong>High:</strong> Exploitable for many users in the default configuration of the affected software. Examples include serious remote denial of service of the system, local root privilege escalations or local data theft.",
  medium:
    "<strong>Medium:</strong> Exploitable for many users of the affected software. Examples include network daemon denial of service, cross-site scripting and gaining user privileges.",
  low:
    "<strong>Low:</strong> Does very little damage or is otherwise hard to exploit, due to small user base or other factors such as requiring specific environment, uncommon configuration, or user assistance. These tend to be included in security updates only when higher priority issues require an update or if many low-priority issues have built up.",
  negligible:
    "<strong>Negligible:</strong> May be a problem, but does not impose a security risk due to various factors. Examples include when the vulnerability is only theoretical in nature, requires a very special situation, has almost no install base or does no real damage. These typically will not receive security updates unless there is an easy fix and some other issue causes an update.",
  unknown:
    "<strong>Unknown:</strong> Open vulnerability where the priority is currently unknown and needs to be triaged.",
};

const statuses = {
  "not-affected":
    "<strong>Not vulnerable:</strong> Packages which do not exist in the archive, are not affected by the vulnerability or have a fix applied in the archive.",
  pending:
    "<strong>Pending:</strong> A fix has been applied and updated packages are awaiting arrival into the archive. For example, this might be used when wider testing is requested for the updated package.",
};

const tooltipIconList = document.querySelectorAll(".cve-tooltip-icon");

tooltipIconList.forEach(function (tooltipIcon) {
  tooltipIcon.addEventListener(
    "mouseover",
    function () {
      if (tooltipIcon.parentElement.querySelector(".cve-tooltip") == null) {
        const priority = this.dataset.priority;
        const status = this.dataset.status;

        if (!(priority in priorities) && !(status in statuses)) {
          return;
        }

        const tooltip = document.createElement("div");
        tooltip.classList.add("cve-tooltip");

        tooltip.innerHTML +=
          "<div class='arrow-up back'></div><div class='arrow-up front'></div>";

        if (priority in priorities) {
          tooltip.innerHTML += priorities[priority];
        }

        if (priority in priorities && status in statuses) {
          tooltip.innerHTML += "<br><br>";
        }

        if (status in statuses) {
          tooltip.innerHTML += statuses[status];
        }

        tooltipIcon.parentElement.append(tooltip);
      }
    },
    false
  );
  tooltipIcon.addEventListener(
    "mouseout",
    function () {
      const tooltip = tooltipIcon.parentElement.querySelector(".cve-tooltip");

      if (tooltip != null) {
        tooltipIcon.parentElement.removeChild(tooltip);
      }
    },
    false
  );
});
