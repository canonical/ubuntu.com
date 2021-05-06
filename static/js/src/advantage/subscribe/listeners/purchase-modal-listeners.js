import {
  ensurePurchaseAccount,
  postCustomerInfoForPurchasePreview,
  postCustomerInfoToStripeAccount,
  postGuestFreeTrial,
  postLoggedInFreeTrial,
} from "../../contracts-api";
import {
  changePaymentCard,
  changeFreeTrial,
  changeBuyingFor,
  checkFreeTrialTerms,
} from "../reducers/form-reducer";
import {
  setAccountID,
  updateField,
  validateField,
} from "../reducers/user-info-reducer";
import { vatCountries } from "../../vat-countries";
import { VALIDITY } from "../reducers/user-info-reducer";
import { debounce } from "../../../utils/debounce";

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

async function createPaymentMethod(name, email, address) {
  try {
    const result = await stripe.createPaymentMethod({
      type: "card",
      card: card,
      billing_details: {
        name: name,
        email: email,
        address: address,
      },
    });

    if (result.error) {
      console.error(result.error);
      return false;
    } else {
      console.log(result.paymentMethod);
      return result.paymentMethod;
    }
  } catch (error) {
    console.error(error);
    return false;
  }
}

async function attachCustomerInfoToStripeAccount(
  VATNumber,
  paymentMethod,
  accountID
) {
  const taxObject = VATNumber
    ? {
        value: VATNumber,
        type: "eu_vat",
      }
    : null;

  const address = paymentMethod["billing_details"].address;
  delete address.line2;
  try {
    const response = await postCustomerInfoToStripeAccount({
      paymentMethodID: paymentMethod.id,
      accountID: accountID,
      address: address,
      name: paymentMethod["billing_details"].name,
      taxID: taxObject,
    });
    const purchasePreviewResponse = await postCustomerInfoForPurchasePreview(
      accountID,
      address,
      taxObject
    );
    console.log({ purchasePreviewResponse });
    // handleCustomerInfoResponse(paymentMethod, response);
  } catch (error) {
    console.error(error);
  }
}

export function checkFormValidity(state) {
  const isOrganisationValid =
    state.form.buyingForMyself ||
    state.userInfo.organisation.validity === VALIDITY.VALID;
  const isStateOrProvinceValid =
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
    isStateOrProvinceValid
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
        console.log("free trial false");
        return false;
      }
    } else {
      // purchase
      if (
        state.form.paymentCard.ok &&
        (!vatCountries.includes(state.userInfo.country.value) ||
          state.userInfo.VATNumber.validity === VALIDITY.VALID)
      ) {
        return "purchase";
      } else {
        console.log("purchase false");
        return false;
      }
    }
  } else {
    console.log("general false");
    return false;
  }
}

async function handleContinueClick(state, dispatch) {
  const address = {
    city: state.userInfo.city.value,
    country: state.userInfo.country.value,
    line1: state.userInfo.street.value,
    postal_code: state.userInfo.postalCode.value,
    state: state.userInfo.countryState.value,
  };

  switch (checkFormValidity(state)) {
    case "freeTrial":
      console.log("Free trial");
      if (state.userInfo.isGuest) {
        postGuestFreeTrial({
          email: state.userInfo.email.value,
          account_name: state.userInfo.organisation.value,
          name: state.userInfo.name.value,
          address: address,
          productListingId: state.form.product.id,
          quantity: state.form.quantity,
        });
      } else {
        //logged in purchase
        ensurePurchaseAccount({
          email: state.userInfo.email.value,
          accountName: state.userInfo.organisation.value,
          paymentMethodID: state.userInfo.defaultPaymentMethod.id,
          country: state.userInfo.country.value,
        }).then((data) => {
          if (!data.ok) {
            // an error was returned, most likely cause
            // is that the user is trying to make a purchase
            // with an email address belonging to an
            // existing SSO account
            console.error(data.error);
          } else {
            const accountID = data.accountID;
            postCustomerInfoToStripeAccount({
              paymentMethodID: state.userInfo.defaultPaymentMethod.id,
              accountID: accountID,
              address: address,
              name: state.userInfo.name.value,
              taxID: null,
            }).then((data) => {
              if (!data.ok) {
                console.error(data.error);
              } else {
                // POST /advantage/post-trial
                postLoggedInFreeTrial({
                  accountID: accountID,
                  name: state.userInfo.name.value,
                  address: address,
                  productListingId: state.form.product.id,
                  quantity: state.form.quantity,
                }).then((data) => {
                  if (!data.ok) {
                    console.error(data.error);
                  } else {
                    // window.location = `/advantage${window.location.search}`;
                  }
                });
              }
            });
          }
        });
      }
      break;
    case "purchase": {
      console.log("purchase");
      const paymentMethod = await createPaymentMethod(
        state.userInfo.name.value,
        state.userInfo.email.value,
        address
      );
      if (state.userInfo.isGuest) {
        //guest purchase
        const response = await ensurePurchaseAccount({
          email: state.userInfo.email.value,
          accountName: state.userInfo.organisation.value,
          paymentMethodID: paymentMethod.id,
          country: state.userInfo.country.value,
        });
        if (response.code) {
          // an error was returned, most likely cause
          // is that the user is trying to make a purchase
          // with an email address belonging to an
          // existing SSO account
          console.error(response);
        } else {
          const accountID = response.accountID;
          dispatch(setAccountID(accountID));
          attachCustomerInfoToStripeAccount(
            state.userInfo.VATNumber.value,
            paymentMethod,
            accountID
          );
        }
      } else {
        //logged in purchase
      }
      break;
    }
  }
}

async function checkVAT(state, dispatch) {
  console.log("checkVAT");
  if (state.userInfo.accountID) {
    const address = {
      city: state.userInfo.city.value,
      country: state.userInfo.country.value,
      line1: state.userInfo.street.value,
      postal_code: state.userInfo.postalCode.value,
      state: state.userInfo.countryState.value,
    };
    const purchasePreviewResponse = await postCustomerInfoForPurchasePreview(
      state.userInfo.accountID,
      address,
      {
        value: state.userInfo.VATNumber.value,
        type: "eu_vat",
      }
    );
    console.log(purchasePreviewResponse);
    if (purchasePreviewResponse.code) {
      // an error was returned, most likely
      // regarding an invalid VAT number.
      console.error(purchasePreviewResponse);
      dispatch(validateField({ field: "VATNumber", valid: false }));
    } else {
      dispatch(validateField({ field: "VATNumber", valid: true }));
    }
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
    field.addEventListener("input", () => {
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

  const VATField = document.querySelector('input[name="VATNumber"]');
  VATField.addEventListener(
    "input",
    debounce(function () {
      checkVAT(store.getState(), store.dispatch);
    }, 500)
  );

  const freeTrialsTermsCheckbox = document.querySelector("#free-trial-terms");
  freeTrialsTermsCheckbox.addEventListener("change", () => {
    store.dispatch(checkFreeTrialTerms());
  });

  const continueButton = document.querySelector("#continue-button");
  continueButton.addEventListener("click", () => {
    handleContinueClick(store.getState(), store.dispatch);
  });
}
