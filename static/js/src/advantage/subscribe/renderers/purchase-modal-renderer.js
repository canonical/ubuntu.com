import { add, format } from "date-fns";
import { vatCountries } from "../../vat-countries";
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
      useTrialRadio.checked = true;
      creditCardSection.classList.add("u-disable");
    } else {
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
  const input = section.querySelector(".p-form-validation__input");
  const message = section.querySelector(".p-form-validation__message");
  input.value = state[input.name].value;

  if (state[input.name].validity === VALIDITY.ERROR && input.required) {
    message.classList.remove("u-hide");
    message.innerHTML = input.validationMessage;
  } else {
    message.classList.add("u-hide");
  }
}

function renderBuyingFor(state) {
  const organisationSection = document.querySelector("#organisation-section");
  const organisationField = organisationSection.querySelector("input");
  const validationMessage = organisationSection.querySelector(
    ".p-form-validation__message"
  );

  if (state.form.buyingForMyself) {
    organisationSection.classList.add("u-disable");
    organisationField.value = "";
    organisationField.required = false;
    validationMessage.classList.add("u-hide");
  } else {
    organisationSection.classList.remove("u-disable");
    organisationField.value = state.userInfo.organisation.value;
    validationMessage.classList.remove("u-hide");
    organisationField.required = true;
  }
}

function renderProvinceOrState(country) {
  const stateContainer = document.querySelector("#us-states-container");
  const provinceContainer = document.querySelector("#ca-provinces-container");

  if (country === "US") {
    stateContainer.classList.remove("u-hide");
    provinceContainer.classList.add("u-hide");
  } else if (country === "CA") {
    stateContainer.classList.add("u-hide");
    provinceContainer.classList.remove("u-hide");
  } else {
    stateContainer.classList.add("u-hide");
    provinceContainer.classList.add("u-hide");
  }
}

function renderVAT(state) {
  const vatContainer = document.querySelector("#vat-container");

  if (vatCountries.includes(state.userInfo.country.value)) {
    vatContainer.classList.remove("u-hide");
  } else {
    vatContainer.classList.add("u-hide");
  }

  if (
    state.form.product.ok &&
    state.form.product.canBeTrialled &&
    state.form.usesFreeTrial
  ) {
    vatContainer.classList.add("u-disable");
  } else {
    vatContainer.classList.remove("u-disable");
  }
}

function renderTotal(state) {
  const VATSection = document.querySelector("#vat-summary-section");
  const excludingVAT = document.querySelector("#excluding-vat");
  const total = document.querySelector("#total");

  const productPrice = state.form.product.ok
    ? state.form.product.price.value / 100
    : 0;

  if (vatCountries.includes(state.userInfo.country.value)) {
    VATSection.classList.remove("u-hide");
    excludingVAT.classList.add("u-hide");
  } else {
    VATSection.classList.add("u-hide");
    excludingVAT.classList.remove("u-hide");
    total.innerHTML = formatter.format(productPrice * state.form.quantity);
  }
}

function renderFreeTrialCheckBox(state) {
  const terms = document.querySelector("#free-trial-terms-section");
  const checkbox = document.querySelector("#free-trial-terms");

  checkbox.checked = state.isFreeTrialsTermsChecked;

  if (state.product.ok && state.product.canBeTrialled && state.usesFreeTrial) {
    terms.classList.remove("u-hide");
  } else {
    terms.classList.add("u-hide");
  }
}

function renderConfirmButton(state) {
  const button = document.querySelector("#continue-button");

  const isOrganisationValid =
    state.form.buyingForMyself ||
    state.userInfo.organisation.validity === VALIDITY.VALID;
  const isStateValid =
    !(state.userInfo.country === "US" || state.userInfo.country === "CA") ||
    state.userInfo.countryState.validity === VALIDITY.VALID;

  if (
    state.userInfo.email.validity === VALIDITY.VALID &&
    state.userInfo.name.validity === VALIDITY.VALID &&
    isOrganisationValid &&
    state.userInfo.street.validity === VALIDITY.VALID &&
    state.userInfo.city.validity === VALIDITY.VALID &&
    state.userInfo.country.validity === VALIDITY.VALID &&
    state.userInfo.postalCode.validity === VALIDITY.VALID &&
    isStateValid
  ) {
    if (
      state.form.product.ok &&
      state.form.product.canBeTrialled &&
      state.form.usesFreeTrial
    ) {
      // free trial
      if (state.form.isFreeTrialsTermsChecked) {
        button.disabled = false;
      } else {
        button.disabled = true;
      }
    } else {
      // purchase
      if (
        state.form.paymentMethod &&
        state.userInfo.VATNumber.validity === VALIDITY.VALID
      ) {
        button.disabled = false;
      } else {
        button.disabled = true;
      }
    }
  } else {
    button.disabled = true;
  }
}

export default function render(state) {
  renderPurchaseModal(state);
  renderFreeTrialField(state.form);
  const fields = document.querySelectorAll(".p-form-validation");
  fields.forEach((field) => {
    renderField(state.userInfo, field);
  });
  renderBuyingFor(state);
  renderProvinceOrState(state.userInfo.country.value);
  renderVAT(state);
  renderTotal(state);
  renderFreeTrialCheckBox(state.form);
  renderConfirmButton(state);
}
