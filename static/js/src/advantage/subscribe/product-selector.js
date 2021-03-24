import { configureStore } from "@reduxjs/toolkit";

import formReducer, {
  changeFeature,
  changeQuantity,
  changeSupport,
  changeType,
  changeVersion,
  changeBilling,
} from "./reducers/form-reducer";

import versionDetails from "./version-details";

const store = configureStore({
  reducer: {
    form: formReducer,
  },
});

const inputs = [
  {
    action: changeType,
    name: "type",
  },
  {
    action: changeVersion,
    name: "version",
  },
  {
    action: changeFeature,
    name: "feature",
  },
  {
    action: changeSupport,
    name: "support",
  },
  {
    action: changeQuantity,
    name: "quantity",
  },
];

const form = document.querySelector(".js-shop-form");

// We add a solid background to the footer so we can hide the "cart" behind it.
const footer = document.querySelector("footer.p-footer");
footer.style.backgroundColor = "white";

function initInputs(action, name) {
  const inputs = form.querySelectorAll(`input[name='${name}']`);
  inputs.forEach((input) => {
    input.addEventListener("input", (e) => {
      store.dispatch(action(e.target.value));
    });
  });
}

inputs.forEach((section) => {
  initInputs(section.action, section.name);
});

const billingSelect = form.querySelector("#billing-period");
billingSelect.addEventListener("change", (e) => {
  store.dispatch(changeBilling(e.target.value));
});

function renderRadios(sections) {
  sections.forEach((section) => {
    const radios = section.querySelectorAll(".js-radio");
    const step = section.dataset.step;
    radios.forEach((radio) => {
      const input = radio.querySelector("input");
      if (input.value === store.getState().form[step]) {
        radio.classList.add("is-selected");
        input.checked = "true";
      } else {
        radio.classList.remove("is-selected");
      }
    });
  });
}

function renderVersionDetails() {
  const details = versionDetails[store.getState().form.version];
  const container = form.querySelector("#version-details");
  const versionNumber = form.querySelector("#version-number");
  var innerHTML = "";
  details.forEach((detail) => {
    innerHTML += `<li class="p-list__item is-ticked">
                    ${detail}
                  </li>`;
  });
  container.innerHTML = innerHTML;
  versionNumber.innerHTML = store.getState().form.version;
}

function renderPublicClouds(sections) {
  const type = store.getState().form.type;
  const awsSection = form.querySelector("#aws-public-cloud");
  const azureSection = form.querySelector("#azure-public-cloud");
  // Show the public cloud section
  if (type === "aws") {
    awsSection.classList.remove("u-hide");
    azureSection.classList.add("u-hide");
  } else if (type === "azure") {
    awsSection.classList.add("u-hide");
    azureSection.classList.remove("u-hide");
  } else {
    awsSection.classList.add("u-hide");
    azureSection.classList.add("u-hide");
  }

  // Disable the rest of the form
  if (type === "aws" || type === "azure") {
    sections.forEach((section) => {
      if (section.dataset.step !== "type") {
        section.classList.add("u-disable");
      }
    });
  } else {
    sections.forEach((section) => {
      section.classList.remove("u-disable");
    });
  }
}

function renderFeature() {
  const supportSection = form.querySelector(
    ".js-form-section[data-step=feature]"
  );
  const radios = supportSection.querySelectorAll(".js-radio");

  if (store.getState().form.type === "desktop") {
    radios.forEach((radio) => {
      const input = radio.querySelector("input");
      if (input.value === "infra+apps") {
        radio.classList.add("u-disable");
      }
    });
  } else {
    radios.forEach((radio) => {
      radio.classList.remove("u-disable");
    });
  }
}

function renderSupport() {
  const supportSection = form.querySelector(
    ".js-form-section[data-step=support]"
  );
  const radios = supportSection.querySelectorAll(".js-radio");

  if (
    store.getState().form.type === "desktop" &&
    store.getState().form.feature === "apps"
  ) {
    radios.forEach((radio) => {
      const input = radio.querySelector("input");
      if (input.value !== "essential") {
        radio.classList.add("u-disable");
      }
    });
  } else {
    radios.forEach((radio) => {
      radio.classList.remove("u-disable");
    });
  }
}

function renderQuantity() {
  const quantity = store.getState().form.quantity;
  const quantityInput = form.querySelector("#quantity-input");
  quantityInput.value = quantity;
}

const imgUrl = {
  physical: "https://assets.ubuntu.com/v1/fdf83d49-Server.svg",
  virtual: "https://assets.ubuntu.com/v1/9ed50294-Virtual+machine.svg",
  desktop: "https://assets.ubuntu.com/v1/4b732966-Laptop.svg",
};

const formatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

function renderSummary() {
  const billing = store.getState().form.billing;
  const type = store.getState().form.type;
  const quantity = store.getState().form.quantity;
  const price = store.getState().form.product.price.value / 100;
  const summarySection = form.querySelector("#summary-section");
  const saveMessage = summarySection.querySelector("#summary-save-with-annual");
  const quantityElement = summarySection.querySelector(
    "#summary-plan-quantity"
  );
  const billingSection = summarySection.querySelector(".js-summary-billing");
  const buyButton = summarySection.querySelector(".js-ua-shop-cta");

  if (!store.getState().form.product.ok) {
    summarySection.classList.add("p-shop-cart--hidden");
    buyButton.classList.add("u-disable");
  } else {
    const image = summarySection.querySelector("#summary-plan-image");
    const title = summarySection.querySelector("#summary-plan-name");
    const costElement = summarySection.querySelector(".js-summary-cost");

    summarySection.classList.remove("p-shop-cart--hidden");
    quantityElement.innerHTML = `${quantity}x`;
    image.setAttribute("src", imgUrl[type]);
    title.innerHTML = store.getState().form.product.name;
    costElement.innerHTML = `${formatter.format(price * quantity)} / ${
      billing === "monthly" ? "month" : "year"
    }`;

    const previous_purchase_id = window.previousPurchaseIds[billing];

    buyButton.classList.remove("u-disable");
    const productObject = JSON.stringify(store.getState().form.product);
    buyButton.dataset.cart = `[{"listingID": "${
      store.getState().form.product.productID
    }", "product": ${productObject}, "quantity": ${quantity}}]`;
    buyButton.dataset.accountId = window.accountId;
    buyButton.dataset.subtotal = price * quantity;
    buyButton.dataset.previousPurchaseId = previous_purchase_id;
  }

  if (
    store.getState().form.feature !== "infra" ||
    store.getState().form.support !== "essential"
  ) {
    billingSection.classList.add("u-hide");
  } else {
    billingSection.classList.remove("u-hide");
  }

  if (billing === "yearly") {
    saveMessage.classList.add("u-hide");
  } else {
    saveMessage.classList.remove("u-hide");
  }

  billingSelect.value = billing;
}

function render() {
  const sections = form.querySelectorAll(".js-form-section");
  renderRadios(sections);
  renderVersionDetails();
  renderPublicClouds(sections);
  renderFeature();
  renderSupport();
  renderQuantity();
  renderSummary();
  console.info("render");
}

render();
store.subscribe(render);
