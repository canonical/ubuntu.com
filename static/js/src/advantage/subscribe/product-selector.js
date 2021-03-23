import { configureStore } from "@reduxjs/toolkit";

import formReducer, {
  changeFeature,
  changeQuantity,
  changeSupport,
  changeType,
  changeVersion,
} from "./reducers/form-reducer";

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

function initInputs(action, name) {
  const inputs = form.querySelectorAll(`input[name='${name}']`);
  inputs.forEach((input) => {
    input.addEventListener("input", (e) => {
      console.log(e.target.value);
      store.dispatch(action(e.target.value));
    });
  });
}

const form = document.querySelector(".js-shop-form");

inputs.forEach((section) => {
  initInputs(section.action, section.name);
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

function render() {
  const sections = form.querySelectorAll(".js-form-section");
  console.log({ sections });
  renderRadios(sections);
  console.info("render");
}

render();
store.subscribe(render);
