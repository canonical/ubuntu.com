import { add, format } from "date-fns";
import { VALIDITY } from "../reducers/user-info-reducer";
import { formatter } from "./form-renderer";

const DATE_FORMAT = "dd MMMM yyyy";

function renderFreeTrialField(state) {
  const freeTrialSection = document.querySelector("#free-trial-section");
  const useTrialRadio = document.querySelector("#use_free_trial_input");
  const payNowRadio = document.querySelector("#pay_now_input");
  const creditCardSection = document.querySelector("#credit-card-section");
  console.log(state.usesFreeTrial);

  if (state.product.ok && state.product.canBeTrialled) {
    freeTrialSection.classList.remove("u-hide");
    if (state.usesFreeTrial) {
      console.log("yoyoyo");
      useTrialRadio.checked = true;
      creditCardSection.classList.add("u-disable");
    } else {
      console.log("bababa");
      payNowRadio.checked = true;
      creditCardSection.classList.remove("u-disable");
    }
  } else {
    freeTrialSection.classList.add("u-hide");
  }
}

function renderPurchaseModal(state) {
  const purchaseModal = document.querySelector("#purchase-modal");

  const summarySection = purchaseModal.querySelector("#summary-section");
  const planType = summarySection.querySelector("#plan-type");
  const allowance = summarySection.querySelector("#allowance");
  const startDate = summarySection.querySelector("#start-date");
  const endDate = summarySection.querySelector("#end-date");
  const subtotal = summarySection.querySelector("#subtotal");

  if (state.form.product.ok) {
    const productPrice = state.form.product.price.value / 100;
    planType.innerHTML = state.form.product.name;
    allowance.innerHTML = `${state.form.quantity} x ${formatter.format(
      productPrice
    )}/${state.form.billing === "monthly" ? "month" : "year"}`;
    startDate.innerHTML = format(new Date(), DATE_FORMAT);
    endDate.innerHTML = format(
      add(new Date(), { months: state.form.billing === "monthly" ? 1 : 12 }),
      DATE_FORMAT
    );
    subtotal.innerHTML = formatter.format(productPrice * state.form.quantity);
  }
}

function renderField(state, section) {
  console.log(section);
  const input = section.querySelector(".p-form-validation__input");
  const message = section.querySelector(".p-form-validation__message");
  console.log(message);
  input.value = state[input.name].value;

  if (state[input.name].validity === VALIDITY.ERROR) {
    console.log("NOT VALID");
    message.classList.remove("u-hide");
    message.innerHTML = input.validationMessage;
  } else {
    console.log("ok");
    message.classList.add("u-hide");
  }
}

export default function render(state) {
  renderPurchaseModal(state);
  renderFreeTrialField(state.form);
  renderField(state.userInfo, document.querySelector(".p-form-validation"));
}
