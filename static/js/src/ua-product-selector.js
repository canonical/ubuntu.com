import { StateManager } from "./utils/state.js";

function productSelector() {
  const form = document.querySelector(".js-shop-form");
  const stepClassPrefix = ".js-shop-step--";
  const products = window.productList;

  const addStep = form.querySelector(`${stepClassPrefix}add`);
  const publicCloudElements = form.querySelectorAll(".js-public-cloud-info");
  const quantityTypeEl = form.querySelector(".js-type-name");
  const steps = ["type", "quantity", "version", "support", "add", "cart"];

  // let cartState = new StateManager(["products"], renderCart);
  let state = new StateManager(steps, render);

  init();
  render();

  function init() {
    const productInputs = form.querySelectorAll(".js-product-input");
    const versionTabs = form.querySelectorAll(
      ".js-shop-step--version .p-tabs__link"
    );

    productInputs.forEach((input) => {
      input.addEventListener("input", (e) => {
        handleStepSpecificAction(e.target);
      });
    });

    versionTabs.forEach((tab) => {
      tab.addEventListener("click", (e) => {
        e.preventDefault();
        state.set("version", [tab.getAttribute("href")]);
      });
    });

    document.addEventListener("click", (e) => {
      if (e.target && e.target.classList.contains("js-add-product")) {
        e.preventDefault();
        const productId = e.target.dataset.productId;
        const quantity = e.target.dataset.quantity;

        state.push("cart", {
          product: products[productId],
          quantity: quantity,
        });
      }
    });
  }

  function buildLineItemHTML(productId, quantity, action) {
    const product = products[productId];

    let button = `<button class="p-button--positive u-no-margin--bottom js-add-product" data-product-id="${productId}" data-quantity=${quantity}>Add</button>`;

    if (action === "remove") {
      button = `<button class="p-button u-no-margin--bottom" data-product="${productId}>Remove</button>`;
    }
    return `
      <div class="row u-vertically-center" style="padding-top: 20px; padding-bottom: 20px;">
        <div class="col-6">
          <span style="font-size: 16px; font-weight: bold;">${
            product.name
          }</span>
        </div>
        <div class="col-2">
          <input class="u-no-margin--bottom" type="text" value="${quantity}" />
        </div>
        <div class="col-2">
          <span>$${product.price.value / 100}</span>
        </div>
        <div class="col-2 u-align--right">
          ${button}
        </div>
      </div>
    `;
  }

  function disableSteps(steps) {
    steps.forEach((step) => {
      const wrapper = form.querySelector(`${stepClassPrefix}${step}`);

      if (wrapper) {
        wrapper.classList.add("u-disable");
      }
    });
  }

  function enableSteps(steps) {
    steps.forEach((step) => {
      const wrapper = form.querySelector(`${stepClassPrefix}${step}`);

      if (wrapper) {
        wrapper.classList.remove("u-disable");
      }
    });
  }

  function handleStepSpecificAction(inputElement) {
    const step = inputElement.name;
    const publicCloudTypes = ["aws", "azure"];

    switch (step) {
      case "type":
        publicCloudElements.forEach((el) => {
          el.classList.add("u-hide");
        });

        if (publicCloudTypes.includes(inputElement.value)) {
          const infoElement = document.querySelector(
            `#${inputElement.value}.js-public-cloud-info`
          );

          infoElement.classList.remove("u-hide");
          state.set(inputElement.name, [inputElement.value]);
          disableSteps(["quantity", "version", "support", "add"]);
        } else {
          quantityTypeEl.innerHTML = `${inputElement.dataset.productName}s`;
          state.set(inputElement.name, [inputElement.value]);
        }

        break;
      case "quantity":
        if (inputElement.value > 0) {
          state.set(inputElement.name, [inputElement.value]);
        } else {
          state.reset("quantity");
        }
        break;
      default:
        state.set(inputElement.name, [inputElement.value]);
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
        if (!state.get(step)[0]) {
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
    const version = state.get("version")[0];
    const quantity = state.get("quantity")[0];

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
        state.set("version", [tab.getAttribute("href")]);
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
    const quantity = state.get("quantity")[0];
    const support = state.get("support")[0];
    const type = state.get("type")[0];
    const productId = `uai-${support}-${type}`;

    if (type && quantity && support && products[productId]) {
      const lineItemHTML = buildLineItemHTML(productId, quantity, "add");
      addStep.innerHTML = lineItemHTML;
      addStep.classList.remove("u-hide");
    } else {
      addStep.classList.add("u-hide");
    }
  }
}

productSelector();
