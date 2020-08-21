function init() {
  const button = document.querySelector(".js-entitlements-callout");

  button.addEventListener("click", (e) => {
    const entitlements = parseEntitlements(e.target.dataset["entitlements"]);
    entitlements.forEach(calloutEntitlement);
  });
}

function calloutEntitlement(entitlement, index) {
  let target = document.querySelector(`[data-entitlement="${entitlement}"]`);
  let interval = 2000;

  if (target) {
    setTimeout(() => {
      target.classList.remove("u-hide");

      setTimeout(() => {
        target.classList.add("u-hide");
      }, interval);
    }, index * interval);
  }
}

function parseEntitlements(entitlementsString) {
  const actualEntitlements = JSON.parse(entitlementsString);
  const possibleEntitlements = [
    "esm-infra",
    "esm-apps",
    "livepatch",
    "fips",
    "cc-eal",
  ];
  let entitlementKeys = [];

  possibleEntitlements.forEach((entitlement) => {
    if (entitlement in actualEntitlements) {
      entitlementKeys.push(entitlement);
    }
  });

  return entitlementKeys;
}

window.addEventListener("DOMContentLoaded", () => {
  init();
});
