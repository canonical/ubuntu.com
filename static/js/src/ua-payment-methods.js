import { setPaymentMethod } from "./advantage/contracts-api.js";

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

card.on("change", (event) => {
  if (event.error) {
    updateButton.disabled = true;
    cardErrorElement.innerHTML = event.error.message;
    cardErrorElement.classList.remove("u-hide");
  } else if (event.complete) {
    updateButton.disabled = false;
    updateButton.focus();
    cardErrorElement.classList.add("u-hide");
  } else {
    cardErrorElement.classList.add("u-hide");
  }
});

const editButton = document.getElementById("edit-payment-details");
const cancelButton = document.getElementById("cancel-payment-details");
const updateButton = document.getElementById("update-payment-details");
const previewSection = document.getElementById(
  "default-payment-method-section"
);
const editSection = document.getElementById("edit-payment-method-section");
const cardErrorElement = document.getElementById("card-errors");

editButton.addEventListener("click", () => {
  previewSection.classList.add("u-hide");
  editSection.classList.remove("u-hide");
});

cancelButton.addEventListener("click", () => {
  previewSection.classList.remove("u-hide");
  editSection.classList.add("u-hide");
});

updateButton.addEventListener("click", function () {
  this.classList.add("is-processing");
  this.innerHTML = '<i class="p-icon--spinner u-animation--spin is-light"></i>';
  this.disabled = true;
  cancelButton.disabled = true;

  stripe
    .createPaymentMethod({
      type: "card",
      card: card,
    })
    .then((result) => {
      setPaymentMethod(window.accountId, result.paymentMethod.id).then(() => {
        location.reload();
      });
    })
    .catch((error) => {
      console.error(error);
      this.classList.remove("is-processing");
      this.innerHTML = "Update";
      this.disabled = false;
      cancelButton.disabled = false;
    });
});
