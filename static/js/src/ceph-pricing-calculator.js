const managedCephPerNodePerYear = 3485.0;
const additionalStoragePerYear = 6050.0;
const infraOnlyPerNodePerYear = 1500.0;
const storageNodeCost = 86221.94;
const managementNodeCost = 9801.89;
const switchCost = 11308.0;

const cephDeploymentCost = 50000;
const hardwareMaintenanceCost = 25000;

const capacityTable = [
  {
    capacity: 2.25,
    nodes: 6,
    switches: 3,
  },
  {
    capacity: 4.5,
    nodes: 12,
    switches: 3,
  },
  {
    capacity: 6.75,
    nodes: 18,
    switches: 3,
  },
  {
    capacity: 9,
    nodes: 24,
    switches: 3,
  },
  {
    capacity: 11.25,
    nodes: 30,
    switches: 6,
  },
  {
    capacity: 13.5,
    nodes: 36,
    switches: 6,
  },
  {
    capacity: 15.75,
    nodes: 42,
    switches: 6,
  },
  {
    capacity: 18,
    nodes: 48,
    switches: 6,
  },
];

function initializeSliders() {
  const isWebkit =
    /Chrome/i.test(navigator.userAgent) || /Safari/i.test(navigator.userAgent);

  const PROGRESS_COLOUR = "#06c";
  const EMPTY_COLOUR = "#D9D9D9";

  /**
      Renders gradient to fake progress color in webkit browsers.
      @param {HTMLElement} slider Slider element to render background on.
      */
  function renderSlider(slider) {
    if (isWebkit) {
      let value = (slider.value - slider.min) / (slider.max - slider.min);
      slider.style.backgroundImage =
        "-webkit-gradient(linear, left top, right top, color-stop(" +
        value +
        ", " +
        PROGRESS_COLOUR +
        "), color-stop(" +
        value +
        ", " +
        EMPTY_COLOUR +
        "))";
    }
  }

  function equaliseValues(receive, give) {
    receive.value = give.value;
    give.value = receive.value;
  }

  function hideNotifications() {
    const notifications = document.querySelectorAll(".js-invalid-notification");
    notifications.forEach((notification) => {
      notification.classList.add("u-hide");
    });
  }

  function showNotification(sliderId, value) {
    let notification;
    if (sliderId === "month-slider") {
      notification = document.querySelector(".js-invalid-month-notification");
    } else if (sliderId === "storage-slider") {
      notification = document.querySelector(".js-invalid-storage-notification");
    }

    if (notification) {
      notification.classList.remove("u-hide");
      const notificationValue = notification.querySelector(
        ".js-notification-value",
      );
      notificationValue.innerHTML = value;
    }
  }

  /**
        Attaches change listener to sliders to update their background color.
        @param {HTMLElement} slider Slider element to render background on.
      */
  function initSlider(slider) {
    const input = document.getElementById(slider.id + "-input");
    renderSlider(slider);

    if (input) {
      equaliseValues(input, slider);

      function validateAndCorrect() {
        hideNotifications();

        if (!input.value) {
          input.value = slider.min;
        }
        // Find the next biggest available step value
        const value = parseFloat(input.value);
        const min = parseFloat(slider.min);
        const max = parseFloat(slider.max);
        const step = parseFloat(slider.step);

        let correctedValue;
        if (value > max) {
          correctedValue = max;
        } else {
          // Round up to the next value
          const steps = Math.ceil((value - min) / step);
          correctedValue = min + steps * step;
        }

        const valueWasCorrected = value !== correctedValue;
        if (valueWasCorrected) {
          showNotification(slider.id, value);
        }

        input.value = correctedValue;
        equaliseValues(slider, input);
        renderSlider(slider);

        // Trigger an update
        slider.dispatchEvent(new Event("input"));
      }

      // Only apply the input value when leaving the input or clicking "enter"
      input.addEventListener("blur", validateAndCorrect);
      input.addEventListener("keydown", function (e) {
        if (e.key === "Enter") {
          validateAndCorrect();
        }
      });
    }

    slider.addEventListener("input", function () {
      if (input) {
        equaliseValues(input, slider);
      }
      renderSlider(slider);
    });
  }

  const compareCostsForm = document.querySelector("#compare-costs-form");
  compareCostsForm.addEventListener("click", function (e) {
    if (e.target.tagName === "INPUT") {
      hideNotifications();
    }
  });
  // Setup all sliders on the page.
  const sliders = document.querySelectorAll("input[type=range]");

  for (let i = 0, l = sliders.length; i < l; i++) {
    initSlider(sliders[i]);
  }
}

document.addEventListener("DOMContentLoaded", function () {
  const monthsInput = document.querySelector("input[name='months']");
  const storageInput = document.querySelector("input[name='storage']");
  const managedInputs = document.querySelectorAll("input[name='managed']");

  let selectedMonths = parseInt(monthsInput.value, 10);
  let selectedStorage = parseFloat(storageInput.value);
  let isManaged;
  managedInputs.forEach((input) => {
    if (input.checked) {
      isManaged = input.value === "managed";
    }
  });

  function calculateCosts() {
    const capacitySpecs =
      capacityTable.find((row) => row.capacity === selectedStorage) || {};

    const nodes = capacitySpecs.nodes;
    const switches = capacitySpecs.switches;

    // Ceph self-hosted cost, see the formula in the spreadsheet copydoc
    // https://docs.google.com/spreadsheets/d/1cn5daIlWGpKF5557ERFY4Ok4_0IlJKTDbZjRXcXyhjk/edit?
    const ubuntuProCost = isManaged
      ? (nodes + 3) * managedCephPerNodePerYear * (selectedMonths / 12)
      : (nodes + 3) * infraOnlyPerNodePerYear * (selectedMonths / 12);

    const additionalStorageCost =
      nodes * additionalStoragePerYear * (selectedMonths / 12);

    const hardwareCost =
      nodes * storageNodeCost + managementNodeCost * 3 + switches * switchCost;

    const cephTotalCost =
      cephDeploymentCost +
      hardwareMaintenanceCost +
      ubuntuProCost +
      additionalStorageCost +
      hardwareCost;

    // Public cloud cost, see the formula in the spreadsheet copydoc
    const publicCloudCost =
      (50 * 1024 * 0.023 +
        450 * 1024 * 0.022 +
        (selectedStorage * 1024 * 1024 - 500) * 0.021) *
      selectedMonths;

    function formatCurrency(value) {
      return `$${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }

    document.getElementById("ceph-cost").textContent =
      formatCurrency(cephTotalCost);
    document.getElementById("ceph-months").textContent = selectedMonths;
    document.getElementById("public-cloud-cost").textContent =
      formatCurrency(publicCloudCost);
    document.getElementById("cloud-months").textContent = selectedMonths;

    document.getElementById("ceph-deployment-price").textContent =
      formatCurrency(cephDeploymentCost);
    document.getElementById("hardware-maintenance-price").textContent =
      formatCurrency(hardwareMaintenanceCost);
    document.getElementById("ubuntu-pro-price").textContent =
      formatCurrency(ubuntuProCost);
    document.getElementById("additional-storage-price").textContent =
      formatCurrency(additionalStorageCost);
    document.getElementById("hardware-price").textContent =
      formatCurrency(hardwareCost);
  }

  monthsInput.addEventListener("input", function () {
    selectedMonths = parseInt(this.value, 10);
    calculateCosts();
  });

  storageInput.addEventListener("input", function () {
    selectedStorage = parseFloat(this.value);
    calculateCosts();
  });

  managedInputs.forEach((input) => {
    input.addEventListener("change", function () {
      isManaged = this.value === "managed";
      calculateCosts();
    });
  });

  calculateCosts();
});

// We initially hide the JS reliant content, so need to show it now that JS is loaded
document.querySelectorAll(".js-show").forEach((ele) => {
  ele.classList.remove("u-hide");
});
initializeSliders();
