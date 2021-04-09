import { changePaymentCard, changeFreeTrial } from "../reducers/form-reducer";
import { updateField, validateField } from "../reducers/user-info-reducer";

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

export default function initPurchaseModalInputs(store) {
  card.on("change", (event) => {
    store.dispatch(changePaymentCard(!event.error && event.complete));
  });

  const freeTrialsRadios = document.querySelectorAll(
    "input[name='free_trial']"
  );
  freeTrialsRadios.forEach((toggle) => {
    toggle.addEventListener("change", (e) => {
      console.log(e.target.value);
      e.preventDefault();
      store.dispatch(changeFreeTrial());
    });
  });

  const field = document.querySelector(".p-form-validation__input");
  console.log(field);
  field.addEventListener("input", (e) => {
    store.dispatch(updateField({ field: field.name, value: e.target.value }));
  });
  field.addEventListener("blur", () => {
    store.dispatch(
      validateField({ field: field.name, valid: field.checkValidity() })
    );
  });
}
