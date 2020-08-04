import { StateManager } from "./utils/state.js";
import { debounce } from "./utils/debounce.js";

function productSelector() {
  const form = document.querySelector(".js-shop-form");
  const stepClassPrefix = ".js-shop-step--";
  const products = window.productList;

  const addStep = form.querySelector(`${stepClassPrefix}add`);
  const cartStep = document.querySelector(`${stepClassPrefix}cart`);
  const shopHeroElement = document.querySelector(".js-shop-hero");
  const publicCloudElements = form.querySelectorAll(".js-public-cloud-info");
  const quantityTypeEl = form.querySelector(".js-type-name");
  const steps = ["type", "quantity", "version", "support", "add", "cart"];

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

    document.addEventListener("click", (e) => {
      if (e.target && e.target.classList.contains("js-cart-action")) {
        e.preventDefault();
        handleCartAction(e.target.dataset);
      }
    });
  }

  function buildCartHTML(lineItems) {
    const subtotal = calculateSubtotal(lineItems);
    let lineItemsHTML = "";

    lineItems.forEach((lineItem) => {
      lineItemsHTML += `<li class="p-list__item">${buildLineItemHTML(
        lineItem.get("productId")[0],
        lineItem.get("quantity")[0],
        lineItem.get("imageURL")[0],
        "remove"
      )}</li>`;
    });

    return `<div class="row">
      <div class="col-12">
        <h2>Your subscription so far:</h2>
      </div>
    </div>
    <div class="row">
      <div class="col-12">
        <ul class="p-list--divided">
          ${lineItemsHTML}
        </ul>
      </div>
    </div>
    <div class="row">
      <div class="col-2 col-start-large-7">
        <h3 class="p-heading--four">Subtotal:</h3>
      </div>

      <div class="col-4 u-align--right">
        <span class="p-heading--four" style="margin-right: 2rem;">${subtotal} /year</span>
        <button class="p-button--positive">Buy now</button>
      </div>
    </div>
    `;
  }

  function buildLineItemHTML(productId, quantity, imageURL, action) {
    const product = products[productId];
    const rawTotal = (product.price.value / 100) * quantity;
    const cost = parseCurrencyAmount(rawTotal, product.price.currency);
    let quantityHTML = `x${quantity}`;

    if (action === "remove") {
      quantityHTML = `<input autocomplete="off" class="js-product-input js-quantity-input u-no-margin--bottom" type="number" name="quantity" value="${quantity}" step="1" style="min-width: 0;" data-stage="cart" data-product-id="${productId}" />`;
    }

    return `
      <div class="row u-vertically-center">
        <div class="col-4">
          <strong>${product.name}</strong>
        </div>
        <div class="col-2 u-vertically-center">
          <img src="${imageURL}" style="height: 30px;" />
        </div>
        <div class="col-2">
          ${quantityHTML}
        </div>
        <div class="col-4 u-align--right">
          <span style="margin-right: 2rem;">
            <strong>${cost} /year</strong>
          </span>
          
          <button class="p-button${
            action === "add" ? "--positive" : ""
          } u-no-margin--bottom js-cart-action" data-image-url="${imageURL}" data-action="${action}" data-product-id="${productId}" data-quantity=${quantity}>${action}</button>
        </div>
      </div>
    `;
  }

  function calculateSubtotal(lineItems) {
    let subtotal = 0;

    lineItems.forEach((lineItem) => {
      const productCost = products[lineItem.get("productId")[0]].price.value;
      subtotal += parseInt(productCost / 100) * lineItem.get("quantity")[0];
    });

    return parseCurrencyAmount(subtotal, "USD");
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

  function handleCartAction(data) {
    const action = data.action;
    const productId = data.productId;
    const imageURL = data.imageUrl;
    const quantity = data.quantity;

    if (action === "add") {
      updateCartState(productId, quantity, imageURL);
      cartStep.scrollIntoView();
      resetForm();
    } else if (action === "remove") {
      state.remove("cart", {
        productId: productId,
        quantity: quantity,
        imageURL: imageURL,
      });
    }
  }

  function handleQuantityInputs(input) {
    const data = input.dataset;
    const formStage = data.stage === "form";
    const selectionStage = data.stage === "selection";
    const formQuantity = form.querySelector(
      'input[name="quantity"][data-stage="form"]'
    );

    if ((formStage && input.value > 0) || (selectionStage && input.value > 0)) {
      // form and selected quantities should sync when either is updated
      state.set(input.name, [input.value]);
      formQuantity.value = state.get("quantity")[0];
    } else if (formStage || selectionStage) {
      state.reset("quantity");
      formQuantity.value = 0;
    } else if (data.stage === "cart") {
      // cart quantity
      const products = state.get("cart");

      products.forEach((product) => {
        if (product.get("productId")[0] === data.productId) {
          product.set("quantity", [input.value]);
        }
      });
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
        }

        break;
      case "quantity":
        debounce(function () {
          handleQuantityInputs(inputElement);
        }, 500)();
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
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(parseFloat(total));
  }

  function render() {
    setActiveSteps();
    setVersionTabs();
    updateCart();
    updateSelectedProduct();
  }

  function resetForm() {
    const selectedInputs = form.querySelectorAll(".is-selected");

    selectedInputs.forEach((input) => {
      input.classList.remove("is-selected");
    });

    state.reset("type");
    state.reset("quantity");
    state.reset("version");
    state.reset("support");
    state.reset("add");
    form.reset();
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

  function updateCart() {
    const lineItems = state.get("cart");

    if (lineItems.length) {
      const cartHTML = buildCartHTML(lineItems);

      cartStep.innerHTML = cartHTML;
      cartStep.classList.remove("u-hide");
      shopHeroElement.classList.add("u-hide");
    } else {
      cartStep.classList.add("u-hide");
      shopHeroElement.classList.remove("u-hide");
    }
  }

  function updateCartState(productId, quantity, imageURL) {
    const cartLineItems = state.get("cart");
    let newLineItem = true;

    cartLineItems.forEach((lineItem) => {
      // avoid multiple rows for the same product
      if (lineItem.get("productId")[0] === productId) {
        quantity = parseInt(quantity);
        quantity += parseInt(lineItem.get("quantity")[0]);
        lineItem.set("quantity", [`${quantity}`]);
        newLineItem = false;
      }
    });

    if (newLineItem) {
      let product = new StateManager(
        ["productId", "quantity", "imageURL"],
        render
      );
      product.set("productId", [productId]);
      product.set("quantity", [`${quantity}`]);
      product.set("imageURL", [imageURL]);
      state.push("cart", product);
    }
  }

  function updateSelectedProduct() {
    const quantity = state.get("quantity")[0];
    const support = state.get("support")[0];
    const type = state.get("type")[0];
    const productsArray = Object.entries(products);
    const productId = `uai-${support}-${type}`;
    const headerHTML =
      "<div class='row'><div class='col-12'><h3>Your chosen plan</h3></div></div>";
    let listingId;
    let privateForAccount = false;

    // check whether user has private offers
    productsArray.forEach((product) => {
      const listingProduct = product[1];
      const isSelectedProduct = listingProduct["productID"] === productId;
      if (listingProduct.private && isSelectedProduct) {
        privateForAccount = true;
        listingId = product[0];
      } else if (!privateForAccount && isSelectedProduct) {
        listingId = product[0];
      }
    });

    if (type && quantity && support && listingId) {
      const imageURL = form
        .querySelector(`.js-image-${type}`)
        .getAttribute("src");
      const lineItemHTML = buildLineItemHTML(
        listingId,
        quantity,
        imageURL,
        "add"
      );
      addStep.innerHTML = headerHTML + lineItemHTML;
      addStep.classList.remove("u-disable");
    } else {
      addStep.innerHTML =
        headerHTML + "<div class='row'><div class='col-12'>&mldr;</div></div>";
      addStep.classList.add("u-disable");
    }
  }
}

productSelector();
