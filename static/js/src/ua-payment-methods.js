import {
  getPurchase,
  retryPurchase,
  setPaymentMethod,
} from "./advantage/api/contracts.js";

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

const cardElement = document.getElementById("card-element");

if (cardElement) {
  card.mount("#card-element");

  card.on("change", (event) => {
    if (event.error) {
      updateButton.disabled = true;
      cardErrorElement.innerHTML = event.error.message;
      cardErrorElement.classList.remove("u-hide");
    } else if (event.complete) {
      updateButton.disabled = false;
      cardErrorElement.classList.add("u-hide");
      paymentErrorElement.classList.add("u-hide");
      paymentErrorElement.querySelector(".p-notification__message").innerHTML =
        "";
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
  const paymentErrorElement = document.getElementById("payment-errors");
  const paymentWarningElement = document.getElementById("payment-warnings");
  const paymentSuccessElement = document.getElementById("payment-success");
  const tryAgainButton = document.getElementById("try-again-button");
  const tryAgainSpinner = document.getElementById("try-again-spinner");

  if (window.pendingPurchaseId) {
    paymentWarningElement.classList.remove("u-hide");

    tryAgainButton.addEventListener("click", function () {
      paymentErrorElement.classList.add("u-hide");
      paymentErrorElement.querySelector(".p-notification__message").innerHTML =
        "";

      tryAgainSpinner.classList.remove("u-hide");
      this.disabled = true;

      retryPayment(tryAgainSpinner);
    });
  }

  editButton.addEventListener("click", () => {
    previewSection.classList.add("u-hide");
    editSection.classList.remove("u-hide");
    paymentErrorElement.classList.add("u-hide");
    paymentErrorElement.querySelector(".p-notification__message").innerHTML =
      "";
  });

  updateButton.addEventListener("click", function () {
    this.classList.add("is-processing");
    this.innerHTML =
      '<i class="p-icon--spinner u-animation--spin is-light"></i>';
    this.disabled = true;
    if (cancelButton) cancelButton.disabled = true;

    stripe
      .createPaymentMethod({
        type: "card",
        card: card,
      })
      .then((result) => {
        if (!result.paymentMethod) {
          handleError();
          return;
        }

        handlePaymentMethod(result);
      })
      .catch(() => {
        handleError();
      });
  });

  if (cancelButton)
    cancelButton.addEventListener("click", () => {
      previewSection.classList.remove("u-hide");
      editSection.classList.add("u-hide");
      paymentErrorElement.classList.add("u-hide");
      paymentErrorElement.querySelector(".p-notification__message").innerHTML =
        "";
    });

  const handleSuccess = (message) => {
    paymentErrorElement.classList.add("u-hide");
    paymentWarningElement.classList.add("u-hide");
    paymentSuccessElement.classList.remove("u-hide");
    paymentSuccessElement.querySelector(
      ".p-notification__message"
    ).innerHTML = `${message}. Reloading page...`;
  };

  const handleError = () => {
    updateButton.classList.remove("is-processing");
    updateButton.innerHTML = "Update";
    updateButton.disabled = false;
    if (cancelButton) cancelButton.disabled = false;
  };

  const handlePaymentMethodErrors = (message) => {
    paymentErrorElement.querySelector(
      ".p-notification__message"
    ).innerHTML = `<strong>${message}</strong> Check the details and try again. Contact <a href='https://ubuntu.com/contact-us'>Canonical sales</a> if the problem persists.`;
    paymentErrorElement.classList.remove("u-hide");
  };

  const handlePaymentMethod = (result) => {
    setPaymentMethod(window.accountId, result.paymentMethod.id).then((data) => {
      if (data.errors) {
        handlePaymentMethodErrors("There was an error with your card.");
        handleError();

        return;
      }

      if (!window.pendingPurchaseId) {
        handleSuccess("Card updated");
        setTimeout(function () {
          location.reload();
        }, 2000);

        return;
      }

      retryPayment(updateButton);
    });
  };

  const authenticate_3ds = async (invoice, element) => {
    const piClientSecret = invoice.paymentStatus.piClientSecret;
    const threeDSResponse = await stripe.confirmCardPayment(piClientSecret);

    resetElement(element);

    if (threeDSResponse.error) {
      handlePaymentMethodErrors("There was an error with the payment.");
    } else {
      handleSuccess("Payment successful");
      setTimeout(function () {
        location.reload();
      }, 2000);
    }
  };

  const retryPayment = async (element) => {
    retryPurchase(window.pendingPurchaseId).then((data) => {
      setTimeout(function () {
        resetElement(element);
        getPurchase(window.pendingPurchaseId).then((purchase) => {
          if (purchase.status === "done") {
            handleSuccess("Payment successful");
            setTimeout(function () {
              location.reload();
            }, 2000);

            return;
          }

          if (!purchase.invoice) {
            handlePaymentMethodErrors("There was an error with the payment.");
            return;
          }

          const invoice = purchase.invoice;

          if (invoice.paymentStatus.status === "need_another_payment_method") {
            handlePaymentMethodErrors("There was an error with the payment.");
            return;
          }

          if (invoice.paymentStatus.status === "need_3ds_authorization") {
            authenticate_3ds(invoice, element);
            return;
          }

          handlePaymentMethodErrors("There was an error with the payment.");
        });
      }, 5000);
    });
  };

  const resetElement = (element) => {
    if (element.tagName === "BUTTON") {
      handleError();
      return;
    }

    element.classList.add("u-hide");
  };
}
