import { StateManager } from "./utils/state.js";

function productSelection() {
  const form = document.querySelector(".js-shop-form");
  const steps = ["type", "quantity", "version", "support", "add"];
  const stepClassPrefix = ".js-shop-step--";
  let productState = new StateManager(steps, render);

  attachEvents();
  setActiveSteps();

  function attachEvents() {
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
      input.addEventListener("input", (e) => {
        disableSteps(["quantity", "version", "support", "add"]);
      });
    });

    versionTabs.forEach((tab) => {
      tab.addEventListener("click", (e) => {
        e.preventDefault();
        checkVersion(e.target.getAttribute("href"));
      });
    });
  }

  function checkVersion(value) {
    let valueToSet = value || "#";

    productState.set("version", [valueToSet]);

    if (!value) {
      enableSteps(["support"]);
    } else if (value === "#other") {
      disableSteps(["support", "add"]);
    } else {
      enableSteps(["support", "add"]);
    }
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
    const validQuantity = step === "quantity" && inputElement.value > 0;
    const version = productState.get("version")[0];
    const quantityTypeEl = document.querySelector(".js-type-name");

    switch (step) {
      case "type":
        quantityTypeEl.innerHTML = `${inputElement.dataset.productName}s`;
        updateProductState(inputElement);
        break;
      case "quantity":
        if (validQuantity) {
          updateProductState(inputElement);
        } else {
          productState.reset("quantity");
        }

        checkVersion(version);
        break;
      default:
        updateProductState(inputElement);
    }
  }

  function render() {
    setActiveSteps();
  }

  function setActiveSteps() {
    let stepsToEnable;
    let stepsToDisable;
    let i = 0;

    steps.forEach((step) => {
      if (!productState.get(step)[0]) {
        stepsToEnable = steps.slice(0, i + 1);
        stepsToDisable = steps.slice(i + 1);
      } else if (i < steps.length) {
        i++;
      }
    });

    if (stepsToEnable) {
      enableSteps(stepsToEnable);
    }

    if (stepsToDisable) {
      disableSteps(stepsToDisable);
    }
  }

  function updateCartLineItem() {
    const cartName = form.querySelector(".js-shop-product-id");
    const cartStep = form.querySelector(`${stepClassPrefix}add`);
    const quantity = productState.get("quantity")[0];
    const support = productState.get("support")[0];
    const type = productState.get("type")[0];

    const productString = `uai-${support}-${type} x ${quantity}`;

    cartName.innerHTML = `Your selected product id is ${productString}`;

    if (type && quantity && support) {
      cartStep.classList.remove("u-hide");
    } else {
      cartStep.classList.add("u-hide");
    }
  }

  function updateProductState(inputElement) {
    productState.set(inputElement.name, [inputElement.value]);

    updateCartLineItem();
  }
}

productSelection();
