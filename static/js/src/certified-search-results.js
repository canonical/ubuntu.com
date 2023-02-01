/* eslint-disable @typescript-eslint/no-unused-vars */

function clearFilters() {
  hideDrawerPageReload();

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
  window.location.assign(objUrl);
  return false;
}

function enableApplyFilters() {
  const filtersSelected = [];
  const filters = document.querySelectorAll(".js-enable-apply-filters");
  filters.forEach((filter) => {
    if (filter.checked) {
      filtersSelected.push(filter);
    }
    filter.addEventListener("change", () => {
      if (!filtersSelected.includes(filter)) {
        filtersSelected.push(filter);
      } else {
        const index = filtersSelected.indexOf(filter);
        filtersSelected.splice(index, 1);
      }
      const button = document.querySelector(".js-apply-filters");
      if (filtersSelected.length) {
        button.removeAttribute("disabled");
      } else {
        button.disabled = true;
      }
    });
  });

  function displayFilterCount() {
    const accordion = document.querySelector(".js-filter-count");
    const accordionTabs = accordion.querySelectorAll(".p-accordion__tab");
    accordionTabs.forEach((tab) => {
      tab.addEventListener("click", () => {
        let categoryFilterCount = 0;
        let vendorFilterCount = 0;
        let releaseFilterCount = 0;
        filtersSelected.forEach((filter) => {
          if (filter.classList.contains("category-filter")) {
            categoryFilterCount++;
          } else if (filter.classList.contains("vendor-filter")) {
            vendorFilterCount++;
          } else if (filter.classList.contains("release-filter")) {
            releaseFilterCount++;
          }
        });
        const chip = tab.querySelector(".p-round-chip");
        chip.classList.toggle("u-hide");

        const categoryChipValue = tab.querySelector("#category-count");
        if (categoryChipValue) {
          if (categoryFilterCount === 0) {
            chip.classList.toggle("u-hide");
          }
          categoryChipValue.innerHTML = categoryFilterCount;
        }
        const vendorChipValue = tab.querySelector("#vendor-count");
        if (vendorChipValue) {
          if (vendorFilterCount === 0) {
            chip.classList.toggle("u-hide");
          }
          vendorChipValue.innerHTML = vendorFilterCount;
        }
        const releaseChipValue = tab.querySelector("#release-count");
        if (releaseChipValue) {
          if (releaseFilterCount === 0) {
            chip.classList.toggle("u-hide");
          }
          releaseChipValue.innerHTML = releaseFilterCount;
        }
      });
    });
  }
  displayFilterCount();
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

function toggleVendorsList() {
  const vendorSectionExists = !!document.querySelector("#vendor-section");
  if (vendorSectionExists) {
    const vendorSection = document.querySelector("#vendor-section");
    const vendorPanel = vendorSection.querySelector(".p-accordion__panel");
    const toggleVendorButtons = document.querySelectorAll(".p-reveal-vendors");
    toggleVendorButtons.forEach((button) => {
      button.addEventListener("click", () => {
        window.scrollTo(0, 360);
        vendorPanel.classList.toggle("is-collapsed");
        toggleVendorButtons.forEach((button) => {
          button.classList.toggle("u-hide");
        });
      });
    });
  }
}

function toggleVersionsList() {
  const versionSection = document.querySelector("#version-section");
  const versionPanel = versionSection.querySelector(".p-accordion__panel");
  const toggleVersionButtons = document.querySelectorAll(".p-reveal-versions");
  toggleVersionButtons.forEach((button) => {
    button.addEventListener("click", () => {
      versionPanel.classList.toggle("is-collapsed");
      toggleVersionButtons.forEach((button) => {
        button.classList.toggle("u-hide");
      });
    });
  });
}

//hides "show all .." and "show fewer" links when the accordion is closed
function toggleShowAllLinks() {
  const filterSections = document.querySelectorAll(
    ".p-accordion__group--certified"
  );
  filterSections.forEach((filterSection) => {
    const tab = filterSection.querySelector(".p-accordion__tab");
    tab.addEventListener("click", () => {
      const links = filterSection.querySelector(".js-toggle-links");
      if (links) {
        links.classList.toggle("u-hide");
      }
    });
  });
}

function hideDrawerPageReload() {
  if (window.location.href.includes("drawer")) {
    const closeDrawerButton = document.querySelector("#toggle-filters");
    closeDrawerButton.click();
  }
}

enableApplyFilters();
toggleVersionsList();
toggleVendorsList();
toggleShowAllLinks();
updateResultsPerPage();
hideDrawerPageReload();
