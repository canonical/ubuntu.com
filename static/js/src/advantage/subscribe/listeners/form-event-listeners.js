import { logSelectOptionEvent } from "advantage/ecom-events";
import {
  changeFeature,
  changeQuantity,
  changeSupport,
  changeType,
  changeVersion,
  changeBilling,
} from "../reducers/form-reducer";

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

export default function initFormInputs(store) {
  function initInputs(action, name) {
    const inputs = form.querySelectorAll(`input[name='${name}']`);
    inputs.forEach((input) => {
      input.addEventListener("input", (e) => {
        store.dispatch(action(e.target.value));
        logSelectOptionEvent(name, e.target.value);
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

  const publicCloudOtherVMLinks = form.querySelectorAll(".js-cloud-other-VM");
  publicCloudOtherVMLinks.forEach((link) => {
    link.addEventListener("click", () => {
      store.dispatch(changeType("virtual"));
    });
  });
}
