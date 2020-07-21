import { StateManager } from "./utils/state.js";

function productSelection() {
  const form = document.querySelector(".js-shop-form");
  const stepClassPrefix = ".js-shop-step--";

  const cartName = form.querySelector(".js-shop-product-id");
  const cartStep = form.querySelector(`${stepClassPrefix}add`);
  const quantityTypeEl = document.querySelector(".js-type-name");
  const steps = ["type", "quantity", "version", "support", "add"];

  let productState = new StateManager(steps, render);

  init();
  render();

  function init() {
    const productInputs = form.querySelectorAll(".js-product-input");
    const publicCloudInputs = form.querySelectorAll(".js-public-cloud-input");
    const versionTabs = form.querySelectorAll(
      ".js-shop-step--version .p-tabs__link"
    );

    productInputs.forEach((input) => {
      input.addEventListener("input", (e) => {
        handleStepSpecificAction(e.target);
      });
    });

    publicCloudInputs.forEach((input) => {
      input.addEventListener("input", () => {
        disableSteps(["quantity", "version", "support", "add"]);
      });
    });

    versionTabs.forEach((tab) => {
      tab.addEventListener("click", (e) => {
        e.preventDefault();
        productState.set("version", [tab.getAttribute("href")]);
      });
    });
  }

  function disableSteps(steps) {
    steps.forEach((step) => {
      const wrapper = form.querySelector(`${stepClassPrefix}${step}`);

      wrapper.classList.add("u-disable");
    });
  }

  function enableSteps(steps) {
    steps.forEach((step) => {
      const wrapper = form.querySelector(`${stepClassPrefix}${step}`);

      wrapper.classList.remove("u-disable");
    });
  }

  function handleStepSpecificAction(inputElement) {
    const step = inputElement.name;

    switch (step) {
      case "type":
        quantityTypeEl.innerHTML = `${inputElement.dataset.productName}s`;
        updateProductState(inputElement);
        break;
      case "quantity":
        if (inputElement.value > 0) {
          updateProductState(inputElement);
        } else {
          productState.reset("quantity");
        }
        break;
      default:
        updateProductState(inputElement);
    }
  }

  function render() {
    setActiveSteps();
    setVersionTabs();
    updateCartLineItem();
  }

  function setActiveSteps() {
    let stepsToEnable;
    let stepsToDisable;
    let i = 0;

    steps.forEach((step) => {
      if (stepsToEnable === undefined) {
        if (!productState.get(step)[0]) {
          stepsToEnable = steps.slice(0, i + 1);
          stepsToDisable = steps.slice(i + 1);
        } else if (i < steps.length) {
          i++;
        }
      }
    });

    if (stepsToEnable) {
      enableSteps(stepsToEnable);
    }

    if (stepsToDisable) {
      disableSteps(stepsToDisable);
    }
  }

  function setVersionTabs() {
    const versionTabs = form.querySelectorAll(
      ".js-shop-step--version .p-tabs__link"
    );
    const version = productState.get("version")[0];
    const quantity = productState.get("quantity")[0];

    if (version === "#other") {
      // disable the rest of the form
      disableSteps(["support", "add"]);
    } else if (quantity) {
      // user has completed the form up to this
      // point, enable the rest of the form
      enableSteps(["support", "add"]);
    }

    versionTabs.forEach((tab) => {
      const tabContentID = tab.getAttribute("href");
      const target = form.querySelector(tabContentID);

      if (!version && tab.getAttribute("aria-selected") === "true") {
        // set initial state on load
        productState.set("version", [tab.getAttribute("href")]);
      } else if (tabContentID === version) {
        tab.setAttribute("aria-selected", true);
        target.classList.remove("u-hide");
      } else {
        tab.setAttribute("aria-selected", false);
        target.classList.add("u-hide");
      }
    });
  }

  function updateCartLineItem() {
    const quantity = productState.get("quantity")[0];
    const support = productState.get("support")[0];
    const type = productState.get("type")[0];
    const productString = `uai-${support}-${type} x ${quantity}`;

    if (type && quantity && support) {
      cartName.innerHTML = `Your selected product id is ${productString}`;
      cartStep.classList.remove("u-hide");
    } else {
      cartStep.classList.add("u-hide");
    }
  }

  function updateProductState(inputElement) {
    productState.set(inputElement.name, [inputElement.value]);
  }
}

productSelection();
