import { StateManager } from "./utils/state.js";
import { debounce } from "./utils/debounce.js";

function productSelector() {
  const form = document.querySelector(".js-shop-form");
  const stepClassPrefix = ".js-shop-step--";
  const products = window.productList;

  const addStep = form.querySelector(`${stepClassPrefix}add`);
  const publicCloudElements = form.querySelectorAll(".js-public-cloud-info");
  const quantityTypeEl = form.querySelector(".js-type-name");
  const steps = [
    "type",
    "quantity",
    "version",
    "support",
    "add",
    "cart",
    "billing",
  ];

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
        if (input.getAttribute("type") === "radio") {
          setSelectedRadioClass(input);
        }

        handleStepSpecificAction(e.target);
      });
    });

    document.addEventListener("input", (e) => {
      if (e.target && e.target.classList.contains("js-product-input")) {
        handleStepSpecificAction(e.target);
      }
    });

    versionTabs.forEach((tab) => {
      tab.addEventListener("click", (e) => {
        e.preventDefault();
        state.set("version", [tab.getAttribute("href")]);
      });
    });

    const billingElement = addStep.querySelector(".js-summary-billing");
    billingElement.addEventListener("change", function (e) {
      state.set("billing", [e.target.value]);
    });

    state.set("billing", ["monthly"]);
  }

  function renderSummary(summaryContainer, productId, imageURL) {
    let product;
    let rawTotal;
    let cost = "";
    let productString = "&mldr;";
    let imageHTML = "";
    const quantity = state.get("quantity")[0];
    const billing = state.get("billing")[0];
    const support = state.get("support")[0];

    if (productId) {
      product = products[productId];
      productString = product.name;
      rawTotal = (product.price.value / 100) * quantity;
      cost = parseCurrencyAmount(rawTotal, product.price.currency);
    }

    if (imageURL) {
      imageHTML = `<img src="${imageURL}" style="height: 32px; float: left;" />`;
    }

    const quantityElement = summaryContainer.querySelector(
      ".js-summary-quantity"
    );
    quantityElement.innerHTML = `× ${quantity.replace(/^0+/, "")}`;

    const productElement = summaryContainer.querySelector(
      ".js-summary-product"
    );
    productElement.innerHTML = `<span>${imageHTML}</span>&nbsp;&nbsp;<span>${productString}</span>`;

    const costElement = summaryContainer.querySelector(".js-summary-cost");
    costElement.innerHTML = `${cost} /${
      billing === "yearly" ? "year" : "month"
    }`;

    const billingElement = summaryContainer.querySelector(
      ".js-summary-billing"
    );
    if (support !== "essential") {
      billingElement.classList.add("u-hide");
    } else {
      billingElement.classList.remove("u-hide");
      billingElement.querySelector("#billing-period").value = billing;
    }

    const saveMessage = summaryContainer.querySelector(
      ".js-summary-save-with-annual"
    );
    if (billing === "yearly") {
      saveMessage.classList.add("u-hide");
    } else {
      saveMessage.classList.remove("u-hide");
    }

    const buyButton = summaryContainer.querySelector(".js-ua-shop-cta");
    var productObject = JSON.stringify(product);
    buyButton.dataset.cart = `[{"listingID": "${productId}", "product": ${productObject}, "quantity": ${quantity}}]`;
    buyButton.dataset.accountId = window.accountId;
    buyButton.dataset.subtotal = product.price.value * quantity;
    buyButton.dataset.previousPurchaseId = "";

    summaryContainer.classList.remove("u-hide");
  }

  function disableSteps(steps) {
    steps.forEach((step) => {
      const wrappers = form.querySelectorAll(`${stepClassPrefix}${step}`);

      wrappers.forEach((wrapper) => {
        const tabbableItems = wrapper.querySelectorAll(
          "input, .p-tabs__link, button, a"
        );

        wrapper.classList.add("u-disable");
        tabbableItems.forEach((item) => {
          item.setAttribute("tabindex", "-1");
        });
      });
    });
  }

  function enableSteps(steps) {
    steps.forEach((step) => {
      const wrappers = form.querySelectorAll(`${stepClassPrefix}${step}`);

      wrappers.forEach((wrapper) => {
        const tabbableItems = wrapper.querySelectorAll(
          "input, .p-tabs__link, button, a"
        );

        wrapper.classList.remove("u-disable");
        tabbableItems.forEach((item) => {
          item.removeAttribute("tabindex");
        });
      });
    });
  }

  function handleQuantityInputs(input) {
    const data = input.dataset;
    const formStage = data.stage === "form";
    const selectionStage = data.stage === "selection";
    const formQuantity = form.querySelector(
      'input[name="quantity"][data-stage="form"]'
    );
    const validQuantity = input.reportValidity();

    if (validQuantity) {
      if (
        (formStage && input.value > 0) ||
        (selectionStage && input.value > 0)
      ) {
        // form and selected quantities should sync when either is updated
        state.set(input.name, [input.value]);
        formQuantity.value = state.get("quantity")[0];
      } else if (formStage || selectionStage) {
        state.reset("quantity");
        formQuantity.value = 0;
      }
    } else {
      input.reportValidity();
      state.reset("quantity");
    }
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
          quantityTypeEl.innerHTML = `How many ${inputElement.dataset.productName}s?`;
          state.set(inputElement.name, [inputElement.value]);
          focusQuantityField();
        }

        break;
      case "quantity":
        debounce(function () {
          handleQuantityInputs(inputElement);
        }, 500)();
        break;
      case "support":
        state.set(inputElement.name, [inputElement.value]);
        if (state.get("support")[0] !== "essential") {
          state.set("billing", ["yearly"]);
        }
        break;
      case "add":
        state.set(inputElement.name, [inputElement.value]);
        break;
      default:
        state.set(inputElement.name, [inputElement.value]);
    }
  }

  function parseCurrencyAmount(total, currency) {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency,
      currencyDisplay: "symbol",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(parseFloat(total));
  }

  function render() {
    setActiveSteps();
    setVersionTabs();
    updateSelectedProduct();
  }

  function setActiveSteps() {
    let stepsToEnable;
    let stepsToDisable;

    steps.forEach((step, i) => {
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

  function setSelectedRadioClass(input) {
    const inputName = input.getAttribute("name");
    const relatedInputs = form.querySelectorAll(
      `input[type="radio"][name="${inputName}"]`
    );

    relatedInputs.forEach((relatedInput) => {
      relatedInput.closest(".p-card--radio").classList.remove("is-selected");
    });

    input.closest(".p-card--radio").classList.add("is-selected");
  }

  function focusQuantityField() {
    const quantityField = document.querySelector(".js-product-quantity");
    quantityField.focus();
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

  function updateSelectedProduct() {
    const quantity = state.get("quantity")[0];
    const support = state.get("support")[0];
    const type = state.get("type")[0];
    const billing = state.get("billing")[0];
    const validVersion = state.get("version")[0] !== "#other";
    const productsArray = Object.entries(products);
    const productId = `uai-${support}-${type}`;
    const completedForm = type && quantity && support && validVersion;
    let listingId;
    let privateForAccount = false;

    // check whether user has private offers
    productsArray.forEach((product) => {
      const listingProduct = product[1];
      let isSelectedProduct = false;
      if (
        listingProduct["productID"] === productId &&
        listingProduct["period"] === billing
      ) {
        isSelectedProduct = true;
      }
      if (listingProduct.private && isSelectedProduct) {
        privateForAccount = true;
        listingId = product[0];
      } else if (!privateForAccount && isSelectedProduct) {
        listingId = product[0];
      }
    });

    if (completedForm && listingId) {
      const imageURL = form
        .querySelector(`.js-image-${type}`)
        .getAttribute("src");

      renderSummary(addStep, listingId, imageURL);
    }
  }
}

productSelector();
