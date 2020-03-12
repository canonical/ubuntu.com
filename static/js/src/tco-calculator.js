const SERVICE_LEVEL_COST_PER_HOST = {
  none: 0,
  essential: 225,
  standard: 750,
  advanced: 1500
};

function initTCOCalculator() {
  attachRangeEvents();
}

function attachRangeEvents() {
  const inputContainers = document.querySelectorAll(
    ".js-tco-calculator__range"
  );

  inputContainers.forEach(container => {
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
}

function renderTotals(initialRollout, yearlyOperationalCost) {
  // const managedRolloutTotalEl = document.querySelector('#intial-rollout--managed');
  // const selfManagedRolloutTotalEl = document.querySelector('#intial-rollout--self');
  // const managedYearlyEl = document.querySelector('#yearly-cost--managed');
  const selfManagedYearlyEl = document.querySelector("#yearly-cost--self");

  const formattedYearlyCost = `$${new Intl.NumberFormat("en-US").format(
    yearlyOperationalCost
  )}`;

  selfManagedYearlyEl.innerHTML = formattedYearlyCost;
}

function updateTotals() {
  const hosts = parseInt(document.querySelector("#hosts__input").value);
  // const dataVolume = parseInt(document.querySelector("#data-volume__input").value);
  const serviceLevel = document.querySelector("[name='self-managed']:checked")
    .value;
  const cloudTypes = document.querySelectorAll("[name='cloud-type']:checked");

  // an additional 3 hosts are required to host MAAS, Juju, etc
  const hostPrice = SERVICE_LEVEL_COST_PER_HOST[serviceLevel] * (hosts + 3);

  let initialRollout = 0;
  let yearlyOperationalCost = 0;

  if (cloudTypes.length > 0) {
    yearlyOperationalCost += hostPrice;
  }

  renderTotals(initialRollout, yearlyOperationalCost);
}

window.addEventListener("DOMContentLoaded", () => {
  const calculator = document.querySelector(".js-tco-calculator");

  if (calculator) {
    initTCOCalculator();
  }
});
