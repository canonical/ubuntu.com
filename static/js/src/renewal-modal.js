import {
  getRenewal,
  postInvoiceIDToRenewal,
  postPaymentMethodToStripeAccount,
  postRenewalIDToProcessPayment,
} from "./stripe/contracts-api.js";

import { parseStripeError } from "./stripe/error-parser.js";

(function () {
  const modal = document.getElementById("renewal-modal");

  const form = document.getElementById("payment-form");
  const paymentMethodDetails = document.getElementById(
    "payment-method-details"
  );
  const progressIndicator = document.getElementById("js-progress-indicator");

  const renewalCTAs = document.querySelectorAll(".js-renewal-cta");

  const addPaymentMethodButton = modal.querySelector(".js-payment-method");
  const cardExpiryEl = modal.querySelector(".js-customer-card-expiry");
  const cardImgEl = modal.querySelector(".js-customer-card-brand");
  const cardTextEl = modal.querySelector(".js-customer-card");
  const customerEmailEl = modal.querySelector(".js-customer-email");
  const customerNameEl = modal.querySelector(".js-customer-name");
  const nameElement = modal.querySelector(".js-renewal-name");
  const processPaymentButton = modal.querySelector(".js-process-payment");
  const quantityElement = modal.querySelector(".js-renewal-quantity");
  const startElement = modal.querySelector(".js-renewal-start");
  const totalElement = modal.querySelector(".js-renewal-total");

  const changePaymentMethodButton = modal.querySelector(
    ".js-change-payment-method"
  );
  const cancelModalButton = modal.querySelector(".js-cancel-modal");

  const cardErrorElement = document.getElementById("card-errors");
  const renewalErrorElement = document.getElementById("renewal-errors");

  const stripe = Stripe("pk_test_yndN9H0GcJffPe0W58Nm64cM00riYG4N46");
  const elements = stripe.elements();

  const style = {
    base: {
      iconColor: "#e95420",
      color: "#111",
      fontWeight: 300,
      fontFamily: "Ubuntu, sans-serif",
      fontSmoothing: "antialiased",
      fontSize: "18px",
      "::placeholder": {
        color: "#666",
      },
      ":-webkit-autofill": {
        color: "#666",
      },
    },
  };

  const card = elements.create("card", { style });

  let accountID;
  let billingInfo;
  let cardInfo;
  let contractID;
  let errorMessage;
  let invoice;
  let paymentIntentStatus;
  let renewalID;
  let subscriptionStatus;
  let submitted3DS = false;

  let pollingTimer;
  let progressTimer1;
  let progressTimer2;
  let progressTimer3;

  attachCTAevents();
  attachModalButtonEvents();
  attachModalEvents();
  setupCardElements();

  function attachCTAevents() {
    renewalCTAs.forEach((cta) => {
      cta.addEventListener("click", () => {
        let renewalData = cta.dataset;

        modal.classList.remove("u-hide");
        accountID = renewalData.accountId;
        contractID = renewalData.contractId;
        renewalID = renewalData.renewalId;

        setRenewalInformation(renewalData);
      });
    });
  }

  function attachModalButtonEvents() {
    addPaymentMethodButton.addEventListener("click", (e) => {
      e.preventDefault();
      createPaymentMethod();
    });

    processPaymentButton.addEventListener("click", (e) => {
      e.preventDefault();
      processStripePayment();
    });

    changePaymentMethodButton.addEventListener("click", (e) => {
      e.preventDefault();
      showPaymentMethodDialog();
    });

    cancelModalButton.addEventListener("click", (e) => {
      e.preventDefault();
      resetModal();
    });
  }

  function attachModalEvents() {
    function toggleModal(modal) {
      if (modal && modal.classList.contains("p-modal")) {
        modal.classList.toggle("u-hide");
      }
    }

    document.addEventListener("click", function (e) {
      let targetControls = e.target.getAttribute("aria-controls");

      if (targetControls) {
        toggleModal(document.getElementById(targetControls));
      }
    });
  }

  function createPaymentMethod() {
    let formData = new FormData(form);

    enableProcessingState("payment_method");

    stripe
      .createPaymentMethod({
        type: "card",
        card: card,
        billing_details: {
          name: formData.get("name"),
          email: formData.get("email"),
          address: {
            city: formData.get("city"),
            country: formData.get("country"),
            line1: formData.get("address"),
            postal_code: formData.get("postal_code"),
          },
        },
      })
      .then((result) => {
        if (result.paymentMethod) {
          handlePaymentMethodResponse(result.paymentMethod);
        } else {
          presentError(result.error.message);
        }
      })
      .catch((error) => {
        console.log(error);
        disableProcessingState();
        presentError();
      });
  }

  function disableProcessingState() {
    clearTimeout(progressTimer1);
    clearTimeout(progressTimer2);
    clearTimeout(progressTimer3);
    resetProgressIndicator();
    cancelModalButton.disabled = false;
  }

  function enableProcessingState(mode) {
    addPaymentMethodButton.disabled = true;
    cancelModalButton.disabled = true;
    processPaymentButton.disabled = true;

    // show a loading spinner
    progressTimer1 = setTimeout(() => {
      progressIndicator.classList.remove("u-hide");

      progressTimer2 = setTimeout(() => {
        if (mode === "payment") {
          progressIndicator.querySelector("span").innerHTML =
            "Making payment...";
        } else if (mode === "payment_method") {
          progressIndicator.querySelector("span").innerHTML =
            "Saving details...";
        }

        progressTimer3 = setTimeout(() => {
          progressIndicator.querySelector("span").innerHTML = "Still trying...";
        }, 11000);
      }, 2000);
    }, 2000);

    // still trying
    progressTimer3 = setTimeout(() => {
      progressIndicator.querySelector("span").innerHTML = "Still trying...";
    }, 15000);
  }

  function handleIncompletePayment(invoice) {
    if (invoice.pi_status === "requires_payment_method") {
      // the user's original payment method failed,
      // capture a new payment method, then post the
      // renewal invoice number to trigger another
      // payment attempt
      postInvoiceIDToRenewal(renewalID, invoice.invoice_id)
        .then((data) => {
          if (data.message) {
            errorMessage = parseStripeError(data);

            if (errorMessage) {
              presentError();
            } else {
              pollRenewalStatus();
            }
          } else {
            pollRenewalStatus();
          }
        })
        .catch((error) => {
          console.log(error);
          pollRenewalStatus();
        });
    } else if (invoice.pi_status === "requires_action" && invoice.pi_secret) {
      // 3DS has been requested by Stripe
      stripe.confirmCardPayment(invoice.pi_secret).then(function (result) {
        submitted3DS = true;

        if (result.error) {
          presentError();
        } else {
          pollRenewalStatus();
        }
      });
    } else {
      // TODO handle this
      presentError();
    }
  }

  function handleIncompleteRenewal(renewal) {
    if (renewal.stripeInvoices) {
      invoice = renewal.stripeInvoices[renewal.stripeInvoices.length - 1];
      subscriptionStatus = invoice.subscription_status;
      paymentIntentStatus = invoice.pi_status;

      console.log("has invoice");
    }

    if (
      !subscriptionStatus ||
      !paymentIntentStatus ||
      subscriptionStatus === "active" ||
      submitted3DS
    ) {
      console.log("isn't incomplete");
      clearTimeout(pollingTimer);

      pollingTimer = setTimeout(() => {
        pollRenewalStatus();
      }, 3000);
    } else if (subscriptionStatus !== "active") {
      console.log("is incomplete");
      handleIncompletePayment(invoice);
    }
  }

  function handlePaymentMethodResponse(paymentMethod) {
    postPaymentMethodToStripeAccount(paymentMethod.id, accountID)
      .then((data) => {
        if (data.message) {
          // ua-contracts returned an error with information for us to parse
          errorMessage = parseStripeError(data);
          presentError();
        } else if (data.createdAt) {
          // payment method was successfully attached,
          // ask user to click "Pay"
          setPaymentInformation(paymentMethod);
          showPayDialog();
        } else {
          // an unexpected error occurred
          presentError();
        }
      })
      .catch((data) => {
        parseStripeError(data);
      });
  }

  function handleSuccessfulPayment() {
    clearTimeout(progressTimer1);
    clearTimeout(progressTimer2);
    clearTimeout(progressTimer3);
    progressIndicator.querySelector(".p-icon--spinner").classList.add("u-hide");
    progressIndicator
      .querySelector(".p-icon--success")
      .classList.remove("u-hide");
    progressIndicator.querySelector("span").innerHTML = "Payment complete";
    progressIndicator.classList.remove("u-hide");

    setTimeout(() => {
      location.search = `subscription=${contractID}`;
    }, 3000);
  }

  function hideErrors() {
    cardErrorElement.innerHTML = "";
    cardErrorElement.classList.add("u-hide");
    renewalErrorElement.querySelector(".p-notification__message").innerHTML =
      "";
    renewalErrorElement.classList.add("u-hide");
    errorMessage = null;
  }

  function pollRenewalStatus() {
    console.log("getting renewal");
    getRenewal(renewalID)
      .then((renewal) => {
        console.log("renewal", renewal);
        if (renewal.status !== "done") {
          console.log("incomplete");
          handleIncompleteRenewal(renewal);
        } else {
          console.log("successful");
          handleSuccessfulPayment();
        }
      })
      .catch((error) => {
        // TODO handle this error
        console.log(error);
        presentError();
      });
  }

  function presentError(type = "renewal") {
    if (!errorMessage) {
      errorMessage =
        "Sorry, there was an unknown error with the payment. Check the details and try again. Contact <a href='https://ubuntu.com/contact-us'>Canonical sales</a> if the problem persists.";
    }

    if (type === "card") {
      cardErrorElement.innerHTML = errorMessage;
      cardErrorElement.classList.remove("u-hide");
    } else if (type === "renewal") {
      renewalErrorElement.querySelector(
        ".p-notification__message"
      ).innerHTML = errorMessage;
      renewalErrorElement.classList.remove("u-hide");
    }

    showPaymentMethodDialog();
  }

  function processStripePayment() {
    enableProcessingState("payment");

    postRenewalIDToProcessPayment(renewalID)
      .then((data) => {
        if (data.code) {
          errorMessage = parseStripeError(data);

          if (errorMessage) {
            console.log("error", errorMessage, data);
            presentError();
          } else {
            console.log("no error");
            pollRenewalStatus();
          }
        } else {
          console.log("no code");
          pollRenewalStatus();
        }
      })
      .catch((error) => {
        console.log(error);
        presentError();
      });
  }

  function resetModal() {
    form.reset();
    card.clear();
    resetProgressIndicator();
    form.classList.remove("u-hide");
    paymentMethodDetails.classList.add("u-hide");
    addPaymentMethodButton.classList.remove("u-hide");
    addPaymentMethodButton.disabled = true;
    processPaymentButton.classList.add("u-hide");
    processPaymentButton.disabled = true;
    errorMessage = null;
  }

  function resetProgressIndicator() {
    progressIndicator
      .querySelector(".p-icon--spinner")
      .classList.remove("u-hide");
    progressIndicator.querySelector(".p-icon--success").classList.add("u-hide");
    progressIndicator.querySelector("span").innerHTML = "";
    progressIndicator.classList.add("u-hide");
  }

  function setRenewalInformation(renewalData) {
    let startDate = new Date(renewalData.start);

    let formattedTotal = parseFloat(renewalData.total).toLocaleString("en", {
      style: "currency",
      currency: renewalData.currency,
    });

    nameElement.innerHTML = `Renew "${renewalData.name}"`;
    quantityElement.innerHTML = `Quantity: ${renewalData.quantity}`;
    startElement.innerHTML = `Start date: ${startDate.toDateString()}`;
    totalElement.innerHTML = `Total: ${formattedTotal}`;
  }

  function setPaymentInformation(paymentMethod) {
    billingInfo = paymentMethod.billing_details;
    cardInfo = paymentMethod.card;

    const cardBrandFormatted =
      cardInfo.brand.charAt(0).toUpperCase() + cardInfo.brand.slice(1);
    const cardText = `${cardBrandFormatted} ending ${cardInfo.last4}`;
    const cardExpiry = `Expires: ${cardInfo.exp_month}/${cardInfo.exp_year}`;

    cardImgEl.innerHTML = cardInfo.brand;
    // TODO use the above to set an image of the card brand, rather than text
    cardTextEl.innerHTML = cardText;
    cardExpiryEl.innerHTML = cardExpiry;
    customerNameEl.innerHTML = billingInfo.name;
    customerEmailEl.innerHTML = billingInfo.email;
  }

  function setupCardElements() {
    card.mount("#card-element");

    card.on("change", ({ error }) => {
      if (error) {
        errorMessage = error.message;
        presentError("card");
      } else {
        hideErrors();
      }
      addPaymentMethodButton.disabled = false;
    });
  }

  function showPaymentMethodDialog() {
    disableProcessingState();
    form.classList.remove("u-hide");
    addPaymentMethodButton.classList.remove("u-hide");
    addPaymentMethodButton.disabled = false;

    paymentMethodDetails.classList.add("u-hide");
    processPaymentButton.classList.add("u-hide");
    processPaymentButton.disabled = true;
  }

  function showPayDialog() {
    hideErrors();
    disableProcessingState();
    form.classList.add("u-hide");
    addPaymentMethodButton.classList.add("u-hide");
    addPaymentMethodButton.disabled = true;

    paymentMethodDetails.classList.remove("u-hide");
    processPaymentButton.classList.remove("u-hide");
    processPaymentButton.disabled = false;
  }
})();
