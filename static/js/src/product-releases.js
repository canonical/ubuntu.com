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

productSelection.addEventListener("change", () => {
  const { product, deployments } = getSelectedProductContext();

  // Clear dependent selects
  resetSelectToPlaceholder(releaseSelection);
  resetSelectToPlaceholder(versionSelection);

  // Only enable if a product is selected and we have deployments
  releaseSelection.disabled = !(product && deployments.length);

  // Populate releases
  deployments.forEach((deployment) => {
    const releaseName = deployment?.name;
    releaseSelection.options[releaseSelection.options.length] = new Option(
      releaseName,
      releaseName,
    );
  });
});

releaseSelection.addEventListener("change", () => {
  resetSelectToPlaceholder(versionSelection);

  const { deployments } = getSelectedProductContext();
  const selectedReleaseName = releaseSelection.value;

  // If no release selected, disable version select and return
  if (!selectedReleaseName) {
    versionSelection.disabled = true;
    return;
  }

  // Find the deployment matching the selected release
  const matchingDeployment = deployments.find(
    (deployment) => deployment?.name === selectedReleaseName,
  );
  const versions = matchingDeployment?.versions || [];

  // Enable version select, then fill
  versionSelection.disabled = false;
  versions.forEach((version) => {
    versionSelection.options[versionSelection.options.length] = new Option(
      version.release,
      version.release,
    );
  });
});

// Add selected options as URL parameters on submit
selectorForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const params = new URLSearchParams();

  const productValue = productSelection.value;
  const releaseValue = releaseSelection.value;
  const versionValue = versionSelection.value;
  const subscriptionValue = subscriptionSelection?.value;

  // TODO: format slugs for consistency
  if (productValue) params.set("product", productValue);
  if (releaseValue) params.set("release", releaseValue);
  if (versionValue) params.set("version", versionValue);
  // TODO: define behavior for subscription param
  if (subscriptionValue) params.set("subscription", subscriptionValue);

  const newUrl = params.toString()
    ? `${window.location.pathname}?${params.toString()}`
    : window.location.pathname;

  window.location.assign(newUrl);
});
