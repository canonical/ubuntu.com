const productSelection = document.getElementById("js-product-selector");
const releaseSelection = document.getElementById("js-release-selector");
const versionSelection = document.getElementById("js-version-selector");
const selectorForm = document.getElementById("js-product-selector-form");
const submitButton = document.getElementById("js-product-selector-submit");
const tooltips = document.querySelectorAll(".js-component-tooltip");
const productValidation = document.getElementById("js-product-validation");
const releaseValidation = document.getElementById("js-release-validation");
const versionValidation = document.getElementById("js-version-validation");
const label = submitButton.querySelector(".js-button-label");
const spinner = submitButton.querySelector(".p-icon--spinner");

function syncSubmitState() {
  const hasProduct = Boolean(productSelection.value);
  const hasRelease = Boolean(releaseSelection.value);

  // Error rules:
  // - Product: always required
  // - Release: should show error if there's no product OR no release
  const productHasError = !hasProduct;
  const releaseHasError = !hasProduct || !hasRelease;

  setFieldError(productValidation, productSelection, productHasError);
  setFieldError(releaseValidation, releaseSelection, releaseHasError);

  const isFormValid = !productHasError && !releaseHasError;
  submitButton.disabled = !isFormValid;
}
submitButton.disabled = true;

// Close button logic for release tooltips
tooltips.forEach((tooltip) => {
  const closeButton = tooltip.querySelector(".js-tooltip-close");
  if (!closeButton) return;

  closeButton.addEventListener("click", (event) => {
    event.stopPropagation();
    tooltip.classList.add("is-tooltip-closed");
  });

  tooltip.addEventListener("mouseleave", () => {
    tooltip.classList.remove("is-tooltip-closed");
  });
});

function setFieldError(validationWrapper, fieldElement, hasError) {
  if (!validationWrapper || !fieldElement) return;

  if (hasError) {
    validationWrapper.classList.add("is-error");
    fieldElement.setAttribute("aria-invalid", "true");
  } else {
    validationWrapper.classList.remove("is-error");
    fieldElement.setAttribute("aria-invalid", "false");
  }
}

// Set current product context
function getSelectedProductContext() {
  const productKey = productSelection.value;
  const product = productsData[productKey];
  const deployments = product?.deployment || [];
  return { productKey, product, deployments };
}

// Reset a select element to its placeholder state
function resetSelectToPlaceholder(selectElement, shouldDisable = true) {
  selectElement.length = 1;
  selectElement.disabled = shouldDisable;
  syncSubmitState();
}

function populateReleaseOptions(deployments) {
  resetSelectToPlaceholder(releaseSelection, false);
  deployments.forEach((deployment) => {
    const name = deployment?.name;
    const slug = deployment?.slug;
    releaseSelection.options[releaseSelection.options.length] = new Option(
      name,
      slug,
    );
  });

  // Auto-select if only one release
  if (deployments.length === 1) {
    releaseSelection.value = deployments[0].slug;
    releaseSelection.dispatchEvent(new Event("change"));
  }
}

function populateVersionOptions(versions) {
  resetSelectToPlaceholder(versionSelection, false);
  versions.forEach((version) => {
    versionSelection.options[versionSelection.options.length] = new Option(
      version.release,
      version.release,
    );
  });
  syncSubmitState();

  // Auto-select if only one version
  if (versions.length === 1) {
    versionSelection.value = versions[0].release;
    versionSelection.dispatchEvent(new Event("change"));

    syncSubmitState();
  }
}

productSelection.addEventListener("change", () => {
  const { product, deployments } = getSelectedProductContext();

  // Clear dependent selects
  resetSelectToPlaceholder(releaseSelection);
  resetSelectToPlaceholder(versionSelection);

  if (product && deployments.length) {
    populateReleaseOptions(deployments);
  } else {
    releaseSelection.disabled = true;
  }
});

releaseSelection.addEventListener("change", () => {
  resetSelectToPlaceholder(versionSelection);

  const { deployments } = getSelectedProductContext();
  const selectedReleaseSlug = releaseSelection.value;

  // If no release selected, disable version select and return
  if (!selectedReleaseSlug) {
    versionSelection.disabled = true;
    syncSubmitState();
    return;
  }

  // Find the deployment matching the selected release
  const matchingDeployment = deployments.find(
    (deployment) => deployment?.slug === selectedReleaseSlug,
  );

  populateVersionOptions(matchingDeployment?.versions || []);
});

versionSelection.addEventListener("change", () => {
  syncSubmitState();
});

// Add selected options as URL parameters on submit
selectorForm.addEventListener("submit", (event) => {
  event.preventDefault();

  // Lock the button and show spinner
  const rect = submitButton.getBoundingClientRect();
  submitButton.style.width = rect.width + "px";
  submitButton.style.height = rect.height + "px";
  submitButton.disabled = true;
  submitButton.classList.add("is-processing");

  if (spinner && label) {
    spinner.classList.remove("u-hide");
    label.classList.add("u-hide");
  }

  const params = new URLSearchParams();

  const productValue = productSelection.value;
  const releaseValue = releaseSelection.value;
  const versionValue = versionSelection.value;

  if (productValue) params.set("product", productValue);
  if (releaseValue) params.set("release", releaseValue);
  if (versionValue) params.set("version", versionValue);

  const newUrl = params.toString()
    ? `${window.location.pathname}?${params.toString()}`
    : window.location.pathname;

  window.location.assign(newUrl);
});

function initStickyHeader() {
  const desktopTable = document.querySelector(".is-desktop");
  if (!desktopTable) return;

  const thead = desktopTable.querySelector("thead");
  if (!thead) return;

  const updateHeaderShadow = () => {
    const computed = getComputedStyle(thead);
    const stickyTop = parseFloat(computed.top) || 0;
    const rect = thead.getBoundingClientRect();

    // Sticky when thead has reached its sticky offset but still in view
    const isSticky =
      rect.top <= stickyTop + 1 && // at or above sticky top
      rect.bottom > stickyTop + 1; // header still visible

    thead.classList.toggle("is-sticky", isSticky);
  };

  window.addEventListener("scroll", updateHeaderShadow, { passive: true });
  window.addEventListener("resize", updateHeaderShadow);
  updateHeaderShadow();
}

function initScrollFade() {
  const container = document.querySelector(".release-cycle-table-scroll");
  const scrollWrapper = container?.querySelector(
    ".release-cycle-table-scroll-inner",
  );
  if (!container || !scrollWrapper) return;

  const updateScrollFade = () => {
    const maxScrollLeft = scrollWrapper.scrollWidth - scrollWrapper.clientWidth;

    // If there's no horizontal overflow, hide the gradient
    if (maxScrollLeft <= 1) {
      container.classList.add("is-at-end");
      return;
    }

    const atEnd = scrollWrapper.scrollLeft >= maxScrollLeft - 2;
    container.classList.toggle("is-at-end", atEnd);
  };

  scrollWrapper.addEventListener("scroll", updateScrollFade, { passive: true });
  window.addEventListener("resize", updateScrollFade);

  updateScrollFade();
}

// Persist selections from URL parameters on page load
function initFromUrl() {
  const params = new URLSearchParams(window.location.search);
  const productParam = params.get("product");
  const releaseParamSlug = params.get("release");
  const versionParam = params.get("version");

  if (productParam && productsData[productParam]) {
    productSelection.value = productParam;

    const { deployments } = getSelectedProductContext();
    if (deployments.length) populateReleaseOptions(deployments);

    if (releaseParamSlug) {
      const match = Array.from(releaseSelection.options).find(
        (opt) => opt.value === releaseParamSlug,
      );

      if (match) {
        releaseSelection.value = match.value;

        const matchingDeployment = deployments.find(
          (deployment) => deployment?.slug === match.value,
        );
        populateVersionOptions(matchingDeployment?.versions || []);
      }
    }

    if (versionParam) {
      versionSelection.value = versionParam;
    }
  }

  syncSubmitState();
}

document.addEventListener("DOMContentLoaded", () => {
  initFromUrl();
  initStickyHeader();
  initScrollFade();
});
