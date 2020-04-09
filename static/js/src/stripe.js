(function () {
  const form = document.getElementById("payment-form");
  const modal = document.getElementById("renewal-modal");
  const paymentMethodDetails = document.getElementById(
    "payment-method-details"
  );
  const renewalCTAs = document.querySelectorAll(".js-renewal-cta");
  const addPaymentMethodButton = document.querySelector(".js-payment-method");
  const processPaymentButton = document.querySelector(".js-process-payment");

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
  let renewalID;
  let invoice;
  let subscriptionStatus;
  let paymentIntentStatus;

  attachCTAevents();
  attachFormSubmitEvents();
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

  function attachFormSubmitEvents() {
    addPaymentMethodButton.addEventListener("click", (e) => {
      e.preventDefault();
      createPaymentMethod();
    });

    processPaymentButton.addEventListener("click", (e) => {
      e.preventDefault();
      processStripePayment();
    });
  }

  function attachModalEvents() {
    function toggleModal(modal) {
      if (modal && modal.classList.contains("p-modal")) {
        modal.classList.toggle("u-hide");
      }
    }

    // Add click handler for clicks on elements with aria-controls
    document.addEventListener("click", function (event) {
      let targetControls = event.target.getAttribute("aria-controls");

      if (targetControls) {
        toggleModal(document.getElementById(targetControls));
      }
    });
  }

  function createPaymentMethod() {
    let formData = new FormData(form);

    addPaymentMethodButton.disabled = true;
    addPaymentMethodButton.classList.add("is-actioned");

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
      .then(function (result) {
        if (result.paymentMethod) {
          fetch("/advantage/payment-method", {
            method: "POST",
            credentials: "include",
            headers: {
              Accept: "application/json",
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              payment_method_id: result.paymentMethod.id,
              account_id: accountID,
            }),
          }).then((response) => {
            if (response.ok) {
              showPayDialog(result.paymentMethod);
            } else {
              console.log(response);
              // TODO: how do we want to handle errors creating payment methods?
              // Feels like it wouldn't inspire confidence to ask the user to try
              // inputting them again.
              presentCardError(
                "We encountered a problem while creating your payment method. Please contact support."
              );
            }
          });
        } else {
          presentCardError(result.error.message);
        }
      })
      .catch((error) => {
        // TODO handle this error
        console.log(error);
      });
  }

  function handleIncompletePayment(invoice) {
    if (
      invoice.pi_status === "requires_payment_method" &&
      invoice.decline_code
    ) {
      console.log("reached if: ", invoice.decline_code);
    } else if (invoice.pi_status === "requires_action" && invoice.pi_secret) {
      stripe.confirmCardPayment(invoice.pi_secret).then(function (result) {
        if (result.error) {
          console.log("3D secure error: ", result.error);
        } else {
          console.log("3D secure success: ", result);
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

    if (!subscriptionStatus || !paymentIntentStatus) {
      setTimeout(() => {
        pollRenewalStatus();
      }, 3000);
    } else if (subscriptionStatus !== "active") {
      handleIncompletePayment(invoice);
    }
  }

  function handleSuccessfulPayment() {
    // TODO trigger a success state (when we know what that looks like)
    alert("payment successful");
    setTimeout(() => {
      location.reload();
    }, 3000);
  }

  function pollRenewalStatus() {
    fetch(`/advantage/renewals/${renewalID}`)
      .then((response) => {
        return response.json();
      })
      .then((renewal) => {
        if (renewal.status !== "done") {
          handleIncompleteRenewal(renewal);
        } else {
          handleSuccessfulPayment();
        }
      })
      .catch((error) => {
        // TODO handle this error
        console.log(error);
      });
  }

  function presentCardError(message) {
    console.log(message);
    cardErrorElement.textContent = message;
    cardErrorElement.classList.add("visible");
  }

  function processStripePayment() {
    processPaymentButton.disabled = true;
    processPaymentButton.classList.add("is-actioned");

    fetch(`/advantage/renewals/${renewalID}/process-payment`, {
      method: "POST",
      credentials: "include",
    })
      .then(() => {
        pollRenewalStatus();
      })
      .catch((error) => {
        // TODO handle this error
        console.log(error);
      });
  }

  function setRenewalInformation(renewalData) {
    const nameElement = modal.querySelector(".js-renewal-name");
    const quantityElement = modal.querySelector(".js-renewal-quantity");
    const startElement = modal.querySelector(".js-renewal-start");
    const totalElement = modal.querySelector(".js-renewal-total");

    let startDate = new Date(renewalData.start);

    let formattedTotal = parseFloat(renewalData.total).toLocaleString("en", {
      style: "currency",
      currency: renewalData.currency,
    });

    nameElement.innerHTML = `Subscription name: ${renewalData.name}`;
    quantityElement.innerHTML = `Quantity: ${renewalData.quantity}`;
    startElement.innerHTML = `Start date: ${startDate.toDateString()}`;
    totalElement.innerHTML = `Total: ${formattedTotal}`;
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

  function showPayDialog(paymentMethod) {
    const billingInfo = paymentMethod.billing_details;
    const cardInfo = paymentMethod.card;
    const cardText = `${cardInfo.brand} ending ${cardInfo.last4}`;
    const cardExpiry = `${cardInfo.exp_month}/${cardInfo.exp_year}`;

    const cardImgEl = document.querySelector(".js-customer-card-brand");
    const cardTextEl = document.querySelector(".js-customer-card");
    const cardExpiryEl = document.querySelector(".js-customer-card-expiry");
    const customerNameEl = document.querySelector(".js-customer-name");
    const customerEmailEl = document.querySelector(".js-customer-email");

    cardImgEl.innerHTML = cardInfo.brand;
    // TODO use the above to set an image of the card brand, rather than text
    cardTextEl.innerHTML = cardText;
    cardExpiryEl.innerHTML = cardExpiry;
    customerNameEl.innerHTML = billingInfo.name;
    customerEmailEl.innerHTML = billingInfo.email;

    form.classList.add("u-hide");
    paymentMethodDetails.classList.remove("u-hide");
    processPaymentButton.disabled = false;
  }
})();
