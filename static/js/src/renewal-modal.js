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

  const addPaymentMethodButton = modal.querySelector(".js-payment-method");
  const processPaymentButton = modal.querySelector(".js-process-payment");
  const changePaymentMethodButton = modal.querySelector(
    ".js-change-payment-method"
  );
  const cancelModalButton = modal.querySelector(".js-cancel-modal");

  const cardErrorElement = document.getElementById("card-errors");
  const renewalErrorElement = document.getElementById("renewal-errors");

  // initialise Stripe
  const stripe = Stripe("pk_test_yndN9H0GcJffPe0W58Nm64cM00riYG4N46");

  // customise the Stripe card field
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

  // create the Stripe card input, and apply the style to it
  const elements = stripe.elements();
  const card = elements.create("card", { style });

  const activeRenewal = {
    accountId: null,
    contractId: null,
    renewalId: null,
  };

  let cardValid = false;
  let changingPaymentMethod = false;
  let submitted3DS = false;

  let pollingTimer;
  let progressTimer;

  function attachCTAevents(selector) {
    const renewalCTAs = document.querySelectorAll(selector);

    renewalCTAs.forEach((cta) => {
      cta.addEventListener("click", () => {
        let renewalData = cta.dataset;

        toggleModal();
        activeRenewal.accountId = renewalData.accountId;
        activeRenewal.contractId = renewalData.contractId;
        activeRenewal.renewalId = renewalData.renewalId;

        setRenewalInformation(renewalData);
      });
    });
  }

  function attachFormEvents() {
    for (let i = 0; i < form.elements.length; i++) {
      const input = form.elements[i];

      input.addEventListener("input", (e) => {
        validateFormInput(e.target);
      });
    }
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
      changingPaymentMethod = true;
      showPaymentMethodDialog();
    });

    cancelModalButton.addEventListener("click", (e) => {
      e.preventDefault();

      if (changingPaymentMethod) {
        changingPaymentMethod = false;
        showPayDialog();
      } else {
        resetModal();
        toggleModal();
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
        console.error(error);
        disableProcessingState();
        presentError();
      });
  }

  function disableProcessingState() {
    clearTimeout(progressTimer);
    resetProgressIndicator();
    cancelModalButton.disabled = false;
  }

  function enableProcessingState(mode) {
    addPaymentMethodButton.disabled = true;
    cancelModalButton.disabled = true;
    processPaymentButton.disabled = true;

    // show a progress indicator that evolves over time
    progressTimer = setTimeout(() => {
      progressIndicator.classList.remove("u-hide");
    }, 2000);

    progressTimer = setTimeout(() => {
      if (mode === "payment") {
        progressIndicator.querySelector("span").innerHTML = "Making payment...";
      } else if (mode === "payment_method") {
        progressIndicator.querySelector("span").innerHTML = "Saving details...";
      }
    }, 4000);

    progressTimer = setTimeout(() => {
      progressIndicator.querySelector("span").innerHTML = "Still trying...";
    }, 15000);

    progressTimer = setTimeout(() => {
      // 3rd error state
    }, 30000);
  }

  function getCardImgFilename(brand) {
    switch (brand) {
      case "visa":
        return "832cf121-visa.png";
      case "mastercard":
        return "83a09dbe-mastercard.png";
      case "amex":
        return "91e62c4f-amex.png";
      default:
        return false;
    }
  }

  function handleIncompletePayment(invoice) {
    if (invoice.pi_status === "requires_payment_method") {
      // the user's original payment method failed,
      // capture a new payment method, then post the
      // renewal invoice number to trigger another
      // payment attempt
      postInvoiceIDToRenewal(activeRenewal.renewalId, invoice.invoice_id)
        .then((data) => {
          if (data.message) {
            const errorMessage = parseStripeError(data);

            if (errorMessage) {
              presentError(errorMessage);
            } else {
              pollRenewalStatus();
            }
          } else {
            pollRenewalStatus();
          }
        })
        .catch((error) => {
          console.error(error);
          pollRenewalStatus();
        });
    } else if (requiresAuthentication(invoice)) {
      // 3DS has been requested by Stripe
      clearTimeout(pollingTimer);
      stripe.confirmCardPayment(invoice.pi_secret).then(function (result) {
        submitted3DS = true;

        if (result.error) {
          presentError(result.error.message);
          submitted3DS = false;
        } else {
          pollRenewalStatus();
        }
      });
    } else {
      presentError();
    }
  }

  function handleIncompleteRenewal(renewal) {
    let invoice;
    let paymentIntentStatus;
    let subscriptionStatus;

    if (renewal.stripeInvoices) {
      invoice = renewal.stripeInvoices[renewal.stripeInvoices.length - 1];
      paymentIntentStatus = invoice.pi_status;
      subscriptionStatus = invoice.subscription_status;
    }

    if (
      !subscriptionStatus ||
      !paymentIntentStatus ||
      subscriptionStatus === "active" ||
      submitted3DS
    ) {
      clearTimeout(pollingTimer);

      pollingTimer = setTimeout(() => {
        pollRenewalStatus();
      }, 3000);
    } else if (subscriptionStatus !== "active") {
      handleIncompletePayment(invoice);
    }
  }

  function handlePaymentMethodResponse(paymentMethod) {
    postPaymentMethodToStripeAccount(paymentMethod.id, activeRenewal.accountId)
      .then((data) => {
        if (data.message) {
          // ua-contracts returned an error with information for us to parse
          const errorMessage = parseStripeError(data);
          presentError(errorMessage);
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
    clearTimeout(progressTimer);
    progressIndicator.querySelector(".p-icon--spinner").classList.add("u-hide");
    progressIndicator
      .querySelector(".p-icon--success")
      .classList.remove("u-hide");
    progressIndicator.querySelector("span").innerHTML = "Payment complete";
    progressIndicator.classList.remove("u-hide");

    setTimeout(() => {
      location.search = `subscription=${activeRenewal.contractId}`;
    }, 3000);
  }

  function hideErrors() {
    cardErrorElement.innerHTML = "";
    cardErrorElement.classList.add("u-hide");
    renewalErrorElement.querySelector(".p-notification__message").innerHTML =
      "";
    renewalErrorElement.classList.add("u-hide");
  }

  function pollRenewalStatus() {
    getRenewal(activeRenewal.renewalId)
      .then((renewal) => {
        if (renewal.status !== "done") {
          handleIncompleteRenewal(renewal);
        } else {
          handleSuccessfulPayment();
        }
      })
      .catch((error) => {
        console.error(error);
        presentError();
      });
  }

  function presentError(message = null, type = "renewal") {
    if (!message) {
      message =
        "Sorry, there was an unknown error with the payment. Check the details and try again. Contact <a href='https://ubuntu.com/contact-us'>Canonical sales</a> if the problem persists.";
    }

    if (type === "card") {
      cardErrorElement.innerHTML = message;
      cardErrorElement.classList.remove("u-hide");
    } else if (type === "renewal") {
      renewalErrorElement.querySelector(
        ".p-notification__message"
      ).innerHTML = message;
      renewalErrorElement.classList.remove("u-hide");
    }

    showPaymentMethodDialog();
  }

  function processStripePayment() {
    enableProcessingState("payment");

    postRenewalIDToProcessPayment(activeRenewal.renewalId)
      .then((data) => {
        if (data.code) {
          const errorMessage = parseStripeError(data);

          if (errorMessage) {
            presentError(errorMessage);
          } else {
            pollRenewalStatus();
          }
        } else {
          pollRenewalStatus();
        }
      })
      .catch((error) => {
        console.error(error);
        presentError();
      });
  }

  function requiresAuthentication(invoice) {
    if (invoice.pi_decline_code) {
      if (invoice.pi_decline_code === "authentication_required") {
        return true;
      }
    }

    if (invoice.pi_status === "requires_action" && invoice.pi_secret) {
      return true;
    }

    return false;
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
    const contractNameElement = modal.querySelector(".js-contract-name");
    const endElement = modal.querySelector(".js-renewal-end");
    const productNameElement = modal.querySelector(".js-product-name");
    const quantityElement = modal.querySelector(".js-renewal-quantity");
    const startElement = modal.querySelector(".js-renewal-start");
    const totalElement = modal.querySelector(".js-renewal-total");

    const contractEndDate = new Date(renewalData.contractEnd);
    const renewalStartDate = new Date(
      contractEndDate.setDate(contractEndDate.getDate() + 1)
    );
    const renewalEndDate = new Date(
      contractEndDate.setMonth(
        contractEndDate.getMonth() + parseInt(renewalData.months)
      )
    );

    let formattedTotal = parseFloat(renewalData.total).toLocaleString("en", {
      style: "currency",
      currency: renewalData.currency,
    });

    contractNameElement.innerHTML = `Renew "${renewalData.name}"`;
    endElement.innerHTML = renewalEndDate.toDateString();
    productNameElement.innerHTML = renewalData.products;
    quantityElement.innerHTML = renewalData.quantity;
    startElement.innerHTML = renewalStartDate.toDateString();
    totalElement.innerHTML = formattedTotal;
  }

  function setPaymentInformation(paymentMethod) {
    const cardExpiryEl = modal.querySelector(".js-customer-card-expiry");
    const cardImgEl = modal.querySelector(".js-customer-card-brand");
    const cardTextEl = modal.querySelector(".js-customer-card");
    const customerEmailEl = modal.querySelector(".js-customer-email");
    const customerNameEl = modal.querySelector(".js-customer-name");
    const billingInfo = paymentMethod.billing_details;
    const cardInfo = paymentMethod.card;

    const cardBrandFormatted =
      cardInfo.brand.charAt(0).toUpperCase() + cardInfo.brand.slice(1);
    const cardText = `${cardBrandFormatted} ending ${cardInfo.last4}`;
    const cardExpiry = `Expires: ${cardInfo.exp_month}/${cardInfo.exp_year}`;
    const cardImage = getCardImgFilename(cardInfo.brand);

    if (cardImage) {
      cardImgEl.innerHTML = `<img src="https://assets.ubuntu.com/v1/${cardImage}" />`;
      cardImgEl.classList.remove("u-hide");
    } else {
      cardImgEl.classList.add("u-hide");
    }
    cardTextEl.innerHTML = cardText;
    cardExpiryEl.innerHTML = cardExpiry;
    customerNameEl.innerHTML = billingInfo.name;
    customerEmailEl.innerHTML = billingInfo.email;
  }

  function setupCardElements() {
    card.mount("#card-element");

    card.on("change", ({ error }) => {
      if (error) {
        addPaymentMethodButton.disabled = true;
        presentError(error.message, "card");
      } else {
        cardValid = true;
        hideErrors();
        validateForm();
      }
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

  function toggleModal() {
    if (modal && modal.classList.contains("p-modal")) {
      modal.classList.toggle("u-hide");
      document.body.classList.toggle("p-modal--active");
    }
  }

  function validateForm() {
    const inputs = form.elements;
    let inputsValidity = [cardValid];

    for (let i = 0; i < inputs.length; i++) {
      const isValid = inputs[i].checkValidity();
      inputsValidity.push(isValid);
    }

    if (inputsValidity.includes(false)) {
      addPaymentMethodButton.disabled = true;
    } else {
      addPaymentMethodButton.disabled = false;
    }
  }

  function validateFormInput(input) {
    const wrapper = input.closest(".p-form-validation");
    let valid = false;

    if (wrapper) {
      const messageEl = wrapper.querySelector(".p-form-validation__message");

      if (!input.checkValidity()) {
        wrapper.classList.add("is-error");
        messageEl.classList.remove("u-hide");
        messageEl.innerHTML = input.validationMessage;
      } else {
        wrapper.classList.remove("is-error");
        messageEl.classList.add("u-hide");
        messageEl.innerHTML = "";

        valid = true;
      }

      validateForm();
    }

    return valid;
  }

  attachCTAevents(".js-renewal-cta");
  attachFormEvents();
  attachModalButtonEvents();
  setupCardElements();
})();
