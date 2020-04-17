import {
  getRenewal,
  postInvoiceIDToRenewal,
  postPaymentMethodToStripeAccount,
  postRenewalIDToProcessPayment,
} from "./stripe/contracts-api.js";

(function () {
  const modal = document.getElementById("renewal-modal");

  const form = document.getElementById("payment-form");
  const paymentMethodDetails = document.getElementById(
    "payment-method-details"
  );
  const renewalCTAs = document.querySelectorAll(".js-renewal-cta");

  const addPaymentMethodButton = modal.querySelector(".js-payment-method");
  const cardExpiryEl = modal.querySelector(".js-customer-card-expiry");
  const cardImgEl = modal.querySelector(".js-customer-card-brand");
  const cardTextEl = modal.querySelector(".js-customer-card");
  const customerEmailEl = modal.querySelector(".js-customer-email");
  const customerNameEl = modal.querySelector(".js-customer-name");
  const loadingIndicator = modal.querySelector(".p-icon--spinner");
  const nameElement = modal.querySelector(".js-renewal-name");
  const processPaymentButton = modal.querySelector(".js-process-payment");
  const quantityElement = modal.querySelector(".js-renewal-quantity");
  const startElement = modal.querySelector(".js-renewal-start");
  const totalElement = modal.querySelector(".js-renewal-total");

  const resetModalButton = modal.querySelector(".js-reset-modal");
  const cancelModalButton = modal.querySelector(".js-cancel-modal");

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
  const cardErrorElement = document.getElementById("card-errors");

  let accountID;
  let billingInfo;
  let cardInfo;
  let invoice;
  let paymentIntentStatus;
  let renewalID;
  let subscriptionStatus;
  let submitted3DS = false;

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

    resetModalButton.addEventListener("click", (e) => {
      e.preventDefault();
      resetModal();
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

    toggleProcessingState();

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
          postPaymentMethodToStripeAccount(result.paymentMethod.id, accountID)
            .then((data) => {
              toggleProcessingState();

              if (data.message) {
                handleErrorResponse(data);
              } else if (data.createdAt) {
                setPaymentInformation(result.paymentMethod);
                showPayDialog();
              } else {
                presentCardError();
              }
            })
            .catch((data) => {
              handleErrorResponse(data);
            });
        } else {
          presentCardError(result.error.message);
        }
      })
      .catch(() => {
        presentCardError();
      });
  }

  function handleErrorResponse(data) {
    const errorString = "unexpected error setting customer payment method: ";
    const processingString = "already accepted: processing";

    if (
      data.code === "renewal is blocked" &&
      data.message.includes(processingString)
    ) {
      // the renewal is still processing, revert to polling its status
      pollRenewalStatus(renewalID);
    } else if (
      data.code === "internal server error" &&
      data.message.includes(errorString)
    ) {
      // Stripe returned an error to the ua-contracts service,
      // find out what it is
      const json_string = data.message.replace(errorString, "");
      const error_object = JSON.parse(json_string);

      presentCardError(error_object.message);
    } else {
      // there was a problem with the ua-contracts service,
      // direct the user to get in touch with a support contact
      presentCardError();
    }
  }

  function handleIncompletePayment(invoice) {
    toggleProcessingState();

    console.log(invoice);

    if (invoice.pi_status === "requires_payment_method") {
      // the user's original payment method failed,
      // capture a new payment method, then post the
      // renewal invoice number to trigger another
      // payment attempt
      // TODO handle this flow
      postInvoiceIDToRenewal(renewalID, invoice.invoice_id).then((data) => {
        console.log(data);
      });
    } else if (invoice.pi_status === "requires_action" && invoice.pi_secret) {
      // 3DS has been requested by Stripe
      stripe.confirmCardPayment(invoice.pi_secret).then(function (result) {
        submitted3DS = true;

        if (result.error) {
          presentCardError();
        } else {
          pollRenewalStatus(renewalID);
        }
      });
    } else {
      console.log("reached else: ", invoice);
    }
  }

  function handleIncompleteRenewal(renewal) {
    if (renewal.stripeInvoices) {
      invoice = renewal.stripeInvoices[renewal.stripeInvoices.length - 1];
      subscriptionStatus = invoice.subscription_status;

      paymentIntentStatus = invoice.pi_status;
    }

    if (!subscriptionStatus || !paymentIntentStatus || submitted3DS) {
      setTimeout(() => {
        pollRenewalStatus();
      }, 3000);
    } else if (subscriptionStatus !== "active") {
      handleIncompletePayment(invoice);
    }
  }

  function handleSuccessfulPayment() {
    setTimeout(() => {
      location.reload();
    }, 3000);
  }

  function pollRenewalStatus() {
    getRenewal(renewalID)
      .then((renewal) => {
        if (renewal.status !== "done") {
          handleIncompleteRenewal(renewal);
        } else {
          toggleProcessingState();
          handleSuccessfulPayment();
        }
      })
      .catch((error) => {
        // TODO handle this error
        console.log(error);
      });
  }

  function presentCardError(message = null) {
    if (!message) {
      message =
        "Sorry, there was an unknown error with the payment. Check the details and try again. Contact <a href='https://ubuntu.com/contact-us'>Canonical sales</a> if the problem persists.";
    }
    cardErrorElement.innerHTML = message;
    cardErrorElement.classList.remove("u-hide");
  }

  function processStripePayment() {
    toggleProcessingState();

    postRenewalIDToProcessPayment(renewalID)
      .then((data) => {
        if (data.code) {
          handleErrorResponse(data);
        } else {
          pollRenewalStatus();
        }
      })
      .catch((error) => {
        // TODO handle this error
        console.log(error);
      });
  }

  function resetModal() {
    form.reset();
    card.clear();
    form.classList.remove("u-hide");
    paymentMethodDetails.classList.add("u-hide");
    addPaymentMethodButton.classList.remove("u-hide");
    addPaymentMethodButton.disabled = true;
    processPaymentButton.classList.add("u-hide");
    processPaymentButton.disabled = true;
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
        cardErrorElement.textContent = error.message;
        cardErrorElement.classList.remove("u-hide");
      } else {
        cardErrorElement.classList.add("u-hide");
      }
      addPaymentMethodButton.disabled = false;
    });
  }

  function showPayDialog() {
    form.classList.add("u-hide");
    addPaymentMethodButton.classList.add("u-hide");

    paymentMethodDetails.classList.remove("u-hide");
    processPaymentButton.classList.remove("u-hide");
    processPaymentButton.disabled = false;
  }

  function toggleProcessingState() {
    if (loadingIndicator.classList.contains("u-hide")) {
      addPaymentMethodButton.disabled = true;
      cancelModalButton.disabled = true;
      processPaymentButton.disabled = true;

      setTimeout(() => {
        loadingIndicator.classList.remove("u-hide");
      }, 2000);
    } else {
      cancelModalButton.disabled = false;
      loadingIndicator.classList.add("u-hide");
    }
  }
})();
