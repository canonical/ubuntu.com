const DEPLOYMENT_TYPE_COSTS = {
  kubernetes_custom: 95000,
  kubernetes_existing: 0,
  kubernetes_reference: 45000,
  openstack_custom: 150000,
  openstack_existing: 0,
  openstack_reference: 75000
};

const MANAGED_SERVICE_COSTS = {
  maas: 300,
  openstack: 4275,
  kubernetes: 3250,
  openstack_and_kubernetes: 6465
};

const SERVICE_LEVEL_COST_PER_HOST = {
  none: 0,
  essential: 225,
  standard: 750,
  advanced: 1500
};

function initTCOCalculator() {
  updateTotals();
  attachInputEvents();
}

function attachInputEvents() {
  const rangeContainers = document.querySelectorAll(
    ".js-tco-calculator__range"
  );
  const checkboxInputs = document.querySelectorAll(
    ".js-tco-calulator__checkbox"
  );
  const radioInputs = document.querySelectorAll(".js-tco-calulator__radio");

  rangeContainers.forEach(container => {
    let input = container.querySelector("input[type='number']");
    let range = container.querySelector("input[type='range']");

    input.addEventListener("input", e => {
      range.value = e.target.value;
      updateTotals();
    });

    range.addEventListener("input", e => {
      input.value = e.target.value;
      updateTotals();
    });
  });

  checkboxInputs.forEach(checkbox => {
    checkbox.addEventListener("input", () => {
      updateTotals();
    });
  });

  radioInputs.forEach(radio => {
    radio.addEventListener("input", () => {
      updateTotals();
    });
  });
}

function renderTotals(rollout, yearly, selfYearly) {
  const rolloutEl = document.querySelector("#intial-rollout--managed");
  const selfRolloutEl = document.querySelector("#intial-rollout--self");
  const yearlyEl = document.querySelector("#yearly-cost--managed");
  const selfYearlyEl = document.querySelector("#yearly-cost--self");

  const formattedRollout = `$${new Intl.NumberFormat("en-US").format(rollout)}`;
  const formattedYearly = `$${new Intl.NumberFormat("en-US").format(yearly)}`;
  const formattedSelfYearly = `$${new Intl.NumberFormat("en-US").format(
    selfYearly
  )}`;

  rolloutEl.innerHTML = formattedRollout;
  selfRolloutEl.innerHTML = formattedRollout;
  yearlyEl.innerHTML = formattedYearly;
  selfYearlyEl.innerHTML = formattedSelfYearly;
}

function updateTotals() {
  // const dataVolume = parseInt(document.querySelector("#data-volume__input").value);
  const deploymentType = document.querySelector(
    "[name='deployment-type']:checked"
  ).value;
  const hosts = parseInt(document.querySelector("#hosts__input").value);
  const kubernetes = document.querySelector("#ct-k8s");
  const kubernetesDeploymentCost =
    DEPLOYMENT_TYPE_COSTS[`kubernetes_${deploymentType}`];
  const openstack = document.querySelector("#ct-openstack");
  const openstackDeploymentCost =
    DEPLOYMENT_TYPE_COSTS[`openstack_${deploymentType}`];
  const serviceLevel = document.querySelector("[name='self-managed']:checked")
    .value;

  // an additional 3 hosts are required to host MAAS, Juju, etc
  const hostCost = SERVICE_LEVEL_COST_PER_HOST[serviceLevel] * (hosts + 3);
  const maasHostCosts = MANAGED_SERVICE_COSTS["maas"] * 3;

  let rollout = 0;
  let yearly = 0;
  let selfYearly = 0;
  let managedServicesCost = 0;

  if (openstack.checked && kubernetes.checked) {
    rollout += kubernetesDeploymentCost + openstackDeploymentCost;

    // managedServicesCost += (hosts * MANAGED_SERVICE_COSTS['openstack_and_kubernetes']) + maasHostCosts;
  } else if (openstack.checked) {
    rollout += openstackDeploymentCost;

    managedServicesCost +=
      hosts * MANAGED_SERVICE_COSTS["openstack"] + maasHostCosts;
  } else if (kubernetes.checked) {
    rollout += kubernetesDeploymentCost;
  }

  if (openstack.checked || kubernetes.checked) {
    yearly += hostCost + managedServicesCost;
    selfYearly += hostCost;
  }

  renderTotals(rollout, yearly, selfYearly);
}

window.addEventListener("DOMContentLoaded", () => {
  const calculator = document.querySelector(".js-tco-calculator");

  if (calculator) {
    initTCOCalculator();
  }
});
