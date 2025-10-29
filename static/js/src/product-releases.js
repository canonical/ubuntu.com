const productSelection = document.getElementById("js-product-selector");
const releaseSelection = document.getElementById("js-release-selector");
const versionSelection = document.getElementById("js-version-selector");
const subscriptionSelection = document.getElementById(
  "js-subscription-selector",
);
const selectorForm = document.getElementById("js-product-selector-form");
const submitButton = document.getElementById("js-product-selector-submit");

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
}

function populateVersionOptions(versions) {
  resetSelectToPlaceholder(versionSelection, false);
  versions.forEach((version) => {
    versionSelection.options[versionSelection.options.length] = new Option(
      version.release,
      version.release,
    );
  });
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
    return;
  }

  // Find the deployment matching the selected release
  const matchingDeployment = deployments.find(
    (deployment) => deployment?.slug === selectedReleaseSlug,
  );

  populateVersionOptions(matchingDeployment?.versions || []);
});

// Add selected options as URL parameters on submit
selectorForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const params = new URLSearchParams();

  const productValue = productSelection.value;
  const releaseValue = releaseSelection.value;
  const versionValue = versionSelection.value;
  const subscriptionValue = subscriptionSelection?.value;

  if (productValue) params.set("product", productValue);
  if (releaseValue) params.set("release", releaseValue);
  if (versionValue) params.set("version", versionValue);
  if (subscriptionValue) params.set("subscription", subscriptionValue);

  const newUrl = params.toString()
    ? `${window.location.pathname}?${params.toString()}`
    : window.location.pathname;

  window.location.assign(newUrl);
});

// Persist selections from URL parameters on page load
(function initFromUrl() {
  const params = new URLSearchParams(window.location.search);
  const productParam = params.get("product");
  const releaseParamSlug = params.get("release");
  const versionParam = params.get("version");
  const subscriptionParam = params.get("subscription");

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
        console.log({ matchingDeployment });
        populateVersionOptions(matchingDeployment?.versions || []);
      }
    }

    if (versionParam) {
      versionSelection.value = versionParam;
    }
  }

  if (subscriptionParam) {
    subscriptionSelection.value = subscriptionParam;
  }
})();
