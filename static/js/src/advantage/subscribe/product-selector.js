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
        section.classList.add("u-disabled");
      }
    });
  } else {
    sections.forEach((section) => {
      section.classList.remove("u-disabled");
    });
  }
}

function renderSummary() {
  const billing = store.getState().form.billing;
  const summarySection = form.querySelector("#summary-section");
  const saveMessage = summarySection.querySelector("#summary-save-with-annual");

  if (!store.getState().form.product.ok) {
    summarySection.classList.add("p-shop-cart--hidden");
  } else {
    summarySection.classList.remove("p-shop-cart--hidden");
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
  renderSummary();
  console.info("render");
}

render();
store.subscribe(render);
