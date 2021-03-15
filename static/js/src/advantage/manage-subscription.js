import { resizeContract, cancelContract } from "./contracts-api.js";

function handleAPICall(APIFunction, parameters) {
  APIFunction(...parameters)
    .then((data) => {
      if (data.errors) {
        console.error(data.errors);
      } else {
        console.log({ data });
        // location.reload();
      }
    })
    .catch((error) => {
      console.error(error);
    });
}

function cancelSubscription(id, VPSize) {
  const cancelSubscriptionButton = document.querySelector(
    `#cancel-subscription--${id}[data-viewport="${VPSize}"]`
  );
  const { accountId, previousPurchaseId } = cancelSubscriptionButton.dataset;
  let contractId = id;

  handleAPICall(cancelContract, [accountId, previousPurchaseId, contractId]);
}

function handleUpdateClick(id, VPSize) {
  const resizeField = document.querySelector(
    `#resize-input--${id}[data-viewport="${VPSize}"]`
  );
  const updateButton = document.querySelector(
    `#save-changes--${id}[data-viewport="${VPSize}"]`
  );
  const { accountId, previousPurchaseId } = updateButton.dataset;
  let contractId = id;

  handleAPICall(resizeContract, [
    accountId,
    previousPurchaseId,
    contractId,
    resizeField.value,
  ]);
}

function createModal(id, VPSize) {
  const cancelSubscriptionButton = document.querySelector(
    `#cancel-subscription--${id}[data-viewport="${VPSize}"]`
  );

  const { contractName, machineCount } = cancelSubscriptionButton.dataset;

  const container = document.createElement("div");
  container.classList.add("p-modal");

  const goBackButton = document.createElement("button");
  goBackButton.classList.add("p-button--neutral");
  goBackButton.textContent = "Go back";

  goBackButton.onclick = () => {
    document.body.removeChild(container);
  };

  const confirmCancelButton = document.createElement("button");
  confirmCancelButton.classList.add("p-button--negative");
  confirmCancelButton.disabled = true;
  confirmCancelButton.textContent = "Yes, cancel subscription";

  confirmCancelButton.onclick = () => {
    cancelSubscription(id, VPSize);
  };

  const confirmCancelField = document.createElement("input");
  confirmCancelField.type = "text";
  confirmCancelField.name = "confirm-cancel";

  confirmCancelField.oninput = (e) => {
    confirmCancelButton.disabled = e.target.value.toLowerCase() !== "cancel";
  };

  const content = `
    <div class="p-modal__dialog" role="dialog" aria-labelledby="modal-title" style="overflow: auto;">
      <header class="p-modal__header">
        <h2 class="p-modal__title ">
          Cancel subscription ${contractName}
        </h2>
      </header>
      <div id="modal-description" class="p-modal__body">
        <p>If you cancel this subscription:</p>
        <ul>
          <li>No additional charge will be incurred.</li>
          <li>The ${
            machineCount > 1
              ? `<strong>${machineCount} machines</strong>`
              : "<strong>machine</strong>"
          } will stop receiving updates and services at the end of the billing period.</li>
          </ul>
        <p>Want help or advice? <a href="/contact-us">Chat with us</a>.</p>
        <div id="cancel-modal-field-wrapper" class="u-align--right">
          <label for="confirm-cancel">Please type <strong>cancel</strong> to confirm.</label>
        </div>
        <div id="cancel-modal-buttons-wrapper" class="u-align--right">
        </div>
      </div>
    </div>
  `;
  container.innerHTML = content;
  document.body.appendChild(container);

  const fieldWrapper = document.querySelector("#cancel-modal-field-wrapper");
  fieldWrapper.appendChild(confirmCancelField);

  const buttonWrapper = document.querySelector("#cancel-modal-buttons-wrapper");
  buttonWrapper.appendChild(goBackButton);
  buttonWrapper.appendChild(confirmCancelButton);
}

function handleCancelChangesClick(id, VPSize) {
  // Hide edit options
  const previewSection = document.querySelector(
    `#view-mode--${id}[data-viewport="${VPSize}"]`
  );
  const editSection = document.querySelector(
    `#edit-mode--${id}[data-viewport="${VPSize}"]`
  );
  previewSection.classList.remove("u-hide");
  editSection.classList.add("u-hide");

  // Reset input and help text
  const resizeField = document.querySelector(
    `#resize-input--${id}[data-viewport="${VPSize}"]`
  );
  resizeField.oninput = () => {};
  resizeField.value = resizeField.defaultValue;
  const resizeSummary = document.querySelector(
    `#resize-summary--${id}[data-viewport="${VPSize}"]`
  );
  const newPayment = document.querySelector(
    `#new-payment--${id}[data-viewport="${VPSize}"]`
  );
  const updateButton = document.querySelector(
    `#save-changes--${id}[data-viewport="${VPSize}"]`
  );
  resizeSummary.classList.add("u-hide");
  newPayment.classList.add("u-hide");
  updateButton.disabled = true;

  // Remove buttons handlers
  const cancelSubscriptionButton = document.querySelector(
    `#cancel-subscription--${id}[data-viewport="${VPSize}"]`
  );
  const cancelChangesButton = document.querySelector(
    `#cancel-changes--${id}[data-viewport="${VPSize}"]`
  );
  updateButton.onclick = () => {};
  cancelChangesButton.onclick = () => {};
  if (cancelSubscriptionButton) cancelSubscriptionButton.onclick = () => {};
}

function handleChange(e, id, VPSize) {
  const defaultValue = Number.parseInt(e.target.defaultValue);
  let newValue = Number.parseInt(e.target.value);

  const unitPrice = Number.parseFloat(e.target.dataset.unitPrice / 100);
  const nextPayment = Number.parseFloat(
    e.target.dataset.nextPayment.split(" ")[0]
  );
  const billingPeriod = e.target.dataset.billingPeriod;

  const formatter = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  });

  const resizeSummary = document.querySelector(
    `#resize-summary--${id}[data-viewport="${VPSize}"]`
  );
  const newPayment = document.querySelector(
    `#new-payment--${id}[data-viewport="${VPSize}"]`
  );
  const updateButton = document.querySelector(
    `#save-changes--${id}[data-viewport="${VPSize}"]`
  );

  const { min, max } = e.target;

  if (newValue < min) {
    newValue = Number.parseInt(min);
    e.target.value = min;
  }

  if (newValue > max) {
    newValue = Number.parseInt(max);
    e.target.value = max;
  }

  const deltaMachines = newValue - defaultValue;

  if (deltaMachines !== 0) {
    resizeSummary.classList.remove("u-hide");
    newPayment.classList.remove("u-hide");
    updateButton.disabled = false;

    if (deltaMachines > 0) {
      resizeSummary.innerHTML = `Your changes will add UA for ${deltaMachines} machines`;
      newPayment.innerHTML = `Your ${billingPeriod} payment will be <strong>increased by ${formatter.format(
        unitPrice * deltaMachines
      )}${
        billingPeriod === "monthly"
          ? `, to ${formatter.format(
              unitPrice * deltaMachines + nextPayment
            )} per month</strong>.`
          : ` per year</strong>. <br/>A payment of ${formatter.format(
              unitPrice * deltaMachines
            )} will be charged immediately`
      }`;
    } else {
      //Downsizing is only for monthly contracts
      resizeSummary.innerHTML = `Your changes will remove UA for ${
        deltaMachines * -1
      } machines`;
      newPayment.innerHTML = `Your monthly payment will be <strong>reduced by ${formatter.format(
        unitPrice * (deltaMachines * -1)
      )}, to ${formatter.format(
        unitPrice * deltaMachines + nextPayment
      )} per month</strong>. <br/>Unused credit will be applied to next month’s invoice.`;
    }
  } else {
    resizeSummary.classList.add("u-hide");
    newPayment.classList.add("u-hide");
    updateButton.disabled = true;
  }
}

function handleChangeClick() {
  const id = this.dataset.id;
  const VPSize = this.dataset.viewport;
  const updateButton = document.querySelector(
    `#save-changes--${id}[data-viewport="${VPSize}"]`
  );
  const cancelChangesButton = document.querySelector(
    `#cancel-changes--${id}[data-viewport="${VPSize}"]`
  );
  const cancelSubscriptionButton = document.querySelector(
    `#cancel-subscription--${id}[data-viewport="${VPSize}"]`
  );
  const resizeField = document.querySelector(
    `#resize-input--${id}[data-viewport="${VPSize}"]`
  );

  // Show edit options
  const previewSection = document.querySelector(
    `#view-mode--${id}[data-viewport="${VPSize}"]`
  );
  const editSection = document.querySelector(
    `#edit-mode--${id}[data-viewport="${VPSize}"]`
  );
  previewSection.classList.add("u-hide");
  editSection.classList.remove("u-hide");

  resizeField.oninput = (e) => {
    handleChange(e, id, VPSize);
  };

  cancelChangesButton.onclick = () => {
    handleCancelChangesClick(id, VPSize);
  };

  updateButton.onclick = () => {
    handleUpdateClick(id, VPSize);
  };

  if (cancelSubscriptionButton) {
    cancelSubscriptionButton.onclick = () => {
      createModal(id, VPSize);
    };
  }
}

const editButtons = document.querySelectorAll(".js-change-subscription-button");

editButtons.forEach((button) => {
  button.addEventListener("click", handleChangeClick);
});
