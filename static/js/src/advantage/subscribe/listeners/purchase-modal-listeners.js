import { postGuestFreeTrial } from "../../contracts-api";
import {
  changePaymentCard,
  changeFreeTrial,
  changeBuyingFor,
  checkFreeTrialTerms,
} from "../reducers/form-reducer";
import { updateField, validateField } from "../reducers/user-info-reducer";
import { VALIDITY } from "../reducers/user-info-reducer";

// initialise Stripe
const stripe = window.Stripe(window.stripePublishableKey);

// customise the Stripe card field
const style = {
  base: {
    iconColor: "#e95420",
    color: "#111",
    fontWeight: 300,
    fontFamily:
      '"Ubuntu", -apple-system, "Segoe UI", "Roboto", "Oxygen", "Cantarell", "Fira Sans", "Droid Sans", "Helvetica Neue", sans-serif',
    fontSmoothing: "antialiased",
    fontSize: "16px",
    "::placeholder": {
      color: "#666",
    },
    ":-webkit-autofill": {
      color: "#666",
    },
  },
};

// create the Stripe card input, and apply the style to it
const elements = stripe.elements({
  fonts: [
    {
      family: "Ubuntu",
    },
  ],
});

const card = elements.create("card", { style });

card.mount("#card-element");

export function checkFormValidity(state) {
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
        return "freeTrial";
      } else {
        return false;
      }
    } else {
      // purchase
      if (
        state.form.paymentMethod &&
        state.userInfo.VATNumber.validity === VALIDITY.VALID
      ) {
        return "purchase";
      } else {
        return false;
      }
    }
  } else {
    return false;
  }
}

function handleContinueClick(state) {
  switch (checkFormValidity(state)) {
    case "freeTrial":
      console.log("Free trial");
      if (state.userInfo.isGuest) {
        postGuestFreeTrial({
          email: state.userInfo.email.value,
          account_name: state.userInfo.organisation.value,
          name: state.userInfo.name.value,
          city: state.userInfo.city.value,
          country: state.userInfo.country.value,
          line1: state.userInfo.street.value,
          postal_code: state.userInfo.postalCode.value,
          state: state.userInfo.countryState.value,
          product_listing_id: state.form.product.id,
          quantity: state.form.quantity,
        });
      } else {
        //logged in purchase
      }
      break;
    case "purchase":
      console.log("purchase");
      break;
  }
}

export default function initPurchaseModalInputs(store) {
  card.on("change", (event) => {
    store.dispatch(changePaymentCard(!event.error && event.complete));
  });

  const freeTrialsRadios = document.querySelectorAll(
    "input[name='free_trial']"
  );
  freeTrialsRadios.forEach((toggle) => {
    toggle.addEventListener("change", (e) => {
      e.preventDefault();
      store.dispatch(changeFreeTrial());
    });
  });

  const buyingForRadios = document.querySelectorAll("input[name='buying_for']");
  buyingForRadios.forEach((toggle) => {
    toggle.addEventListener("change", (e) => {
      e.preventDefault();
      store.dispatch(changeBuyingFor());
    });
  });

  const fields = document.querySelectorAll(".p-form-validation__input");
  fields.forEach((field) => {
    field.addEventListener("input", (e) => {
      store.dispatch(updateField({ field: field.name, value: e.target.value }));
    });
    field.addEventListener("blur", () => {
      store.dispatch(
        validateField({ field: field.name, valid: field.checkValidity() })
      );
    });
  });

  const countrySelect = document.querySelector("select#Country");
  countrySelect.addEventListener("input", (e) => {
    store.dispatch(updateField({ field: "country", value: e.target.value }));
    store.dispatch(
      validateField({ field: "country", valid: e.target.value !== "" })
    );
  });

  countrySelect.name = "country";
  countrySelect.classList.add("p-form-validation__input");

  const USStateSelect = document.querySelector("select#us_state");
  const CAProvinceSelect = document.querySelector("select#ca_province");

  [USStateSelect, CAProvinceSelect].forEach((select) => {
    select.addEventListener("input", (e) => {
      store.dispatch(
        updateField({ field: "countryState", value: e.target.value })
      );
      store.dispatch(
        validateField({ field: "countryState", valid: e.target.value !== "" })
      );
    });
    select.name = "countryState";
    select.classList.add("p-form-validation__input");
    select.required = true;
  });

  const freeTrialsTermsCheckbox = document.querySelector("#free-trial-terms");
  freeTrialsTermsCheckbox.addEventListener("change", () => {
    store.dispatch(checkFreeTrialTerms());
  });

  const continueButton = document.querySelector("#continue-button");
  continueButton.addEventListener("click", () => {
    handleContinueClick(store.getState());
  });
}
