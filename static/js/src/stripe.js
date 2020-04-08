(function () {
  const form = document.getElementById("payment-form");
  const modal = document.getElementById("renewal-modal");
  const renewalCTAs = document.querySelectorAll(".js-renewal-cta");
  const addPaymentMethodButton = form.querySelector(".js-payment-method");
  const processPaymentButton = form.querySelector(".js-process-payment");

  const stripe = Stripe("pk_test_yndN9H0GcJffPe0W58Nm64cM00riYG4N46");
  const elements = stripe.elements();
  const card = elements.create("card", { style });
  const cardErrorElement = document.getElementById("card-errors");

  let accountID;
  let renewalID;
  let subscriptionStatus;
  let paymentIntentStatus;

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
    addPaymentMethodButton
      .querySelector(".p-icon--spinner")
      .classList.remove("u-hide");

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
              addPaymentMethodButton.classList.add("u-hide");
              processPaymentButton.classList.remove("u-hide");
              processPaymentButton.disabled = false;
            } else {
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

  function handleIncompletePayment(pi_status) {
    console.log(pi_status);
  }

  function handleIncompleteRenewal(renewal) {
    if (renewal.stripeInvoices.length > 0) {
      subscriptionStatus =
        renewal.stripeInvoices[renewal.stripeInvoices.length - 1]
          .subscription_status;

      paymentIntentStatus =
        renewal.stripeInvoices[renewal.stripeInvoices.length - 1].pi_status;
    }

    if (!subscriptionStatus) {
      setTimeout(pollRenewalStatus(), 1000);
    } else if (subscriptionStatus !== "active") {
      handleIncompletePayment(paymentIntentStatus);
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
    processPaymentButton
      .querySelector(".p-icon--spinner")
      .classList.remove("u-hide");

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
    const paymentTotalElement = modal.querySelector(".js-payment-total");

    let startDate = new Date(renewalData.start);

    let formattedTotal = parseFloat(renewalData.total).toLocaleString("en", {
      style: "currency",
      currency: renewalData.currency,
    });

    nameElement.innerHTML = `Subscription name: ${renewalData.name}`;
    quantityElement.innerHTML = `Quantity: ${renewalData.quantity}`;
    startElement.innerHTML = `Start date: ${startDate.toDateString()}`;
    totalElement.innerHTML = `Total: ${formattedTotal}`;
    paymentTotalElement.innerHTML = formattedTotal;
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
})();
