import { resizeContract, cancelContract } from "./contracts-api.js";

function cancelSubscription(id) {
  const cancelSubscriptionButton = document.getElementById(
    `cancel-subscription--${id}`
  );
  const { accountId, previousPurchaseId } = cancelSubscriptionButton.dataset;
  let contractId = id;
  if (id.includes("--mobile")) {
    contractId = id.replace("--mobile", "");
  }

  cancelContract(accountId, previousPurchaseId, contractId)
    .then((data) => {
      if (data.error) {
        console.error(data.error);
      } else {
        location.reload();
      }
    })
    .catch((error) => {
      console.error(error);
    });
}

function handleUpdateClick(id) {
  const resizeField = document.getElementById(`resize-input--${id}`);
  const updateButton = document.getElementById(`save-changes--${id}`);
  const { accountId, previousPurchaseId } = updateButton.dataset;
  let contractId = id;
  if (id.includes("--mobile")) {
    contractId = id.replace("--mobile", "");
  }

  resizeContract(accountId, previousPurchaseId, contractId, resizeField.value)
    .then((data) => {
      if (data.error) {
        console.error(data.error);
      } else {
        location.reload();
      }
    })
    .catch((error) => {
      console.error(error);
    });
}

function createModal(id) {
  const cancelSubscriptionButton = document.getElementById(
    `cancel-subscription--${id}`
  );

  const { contractName, machineCount } = cancelSubscriptionButton.dataset;

  const container = document.createElement("div");

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
    cancelSubscription(id);
  };

  const confirmCancelField = document.createElement("input");
  confirmCancelField.type = "text";
  confirmCancelField.name = "confirm-cancel";

  confirmCancelField.oninput = (e) => {
    confirmCancelButton.disabled = e.target.value.toLowerCase() !== "cancel";
  };

  container.classList.add("p-modal");
  const content = `
    <div class="p-modal__dialog" role="dialog" aria-labelledby="modal-title" style="overflow: auto;">
      <header class="p-modal__header">
        <h2 class="p-modal__title ">
          Cancel subscription ${contractName}
        </h2>
      </header>
      <div id="modal-description" class="p-modal__body">
        <p>if you cancel this subscription:</p>
        <ul>
          <li>No additional charge will be incurred.</li>
          <li>The ${
            machineCount > 1
              ? `<strong>${machineCount} machines</strong>`
              : "<strong>machines</strong>"
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

  const fieldWrapper = document.getElementById("cancel-modal-field-wrapper");
  fieldWrapper.appendChild(confirmCancelField);

  const buttonWrapper = document.getElementById("cancel-modal-buttons-wrapper");
  buttonWrapper.appendChild(goBackButton);
  buttonWrapper.appendChild(confirmCancelButton);
}

function handleCancelChangesClick(id) {
  // Hide edit options
  const previewSection = document.getElementById(`view-mode--${id}`);
  const editSection = document.getElementById(`edit-mode--${id}`);
  previewSection.classList.remove("u-hide");
  editSection.classList.add("u-hide");

  // Reset input and help text
  const resizeField = document.getElementById(`resize-input--${id}`);
  resizeField.oninput = () => {};
  resizeField.value = resizeField.defaultValue;
  const resizeSummary = document.getElementById(`resize-summary--${id}`);
  const newPayment = document.getElementById(`new-payment--${id}`);
  const updateButton = document.getElementById(`save-changes--${id}`);
  resizeSummary.classList.add("u-hide");
  newPayment.classList.add("u-hide");
  updateButton.disabled = true;

  // Remove buttons handlers
  const cancelSubscriptionButton = document.getElementById(
    `cancel-subscription--${id}`
  );
  const cancelChangesButton = document.getElementById(`cancel-changes--${id}`);
  updateButton.onclick = () => {};
  cancelChangesButton.onclick = () => {};
  if (cancelSubscriptionButton) cancelSubscriptionButton.onclick = () => {};
}

function handleChange(e, id) {
  const defaultValue = Number.parseInt(e.target.defaultValue);
  let newValue = Number.parseInt(e.target.value);

  const unitPrice = Number.parseFloat(e.target.dataset.unitPrice.split(" ")[0]);
  const nextPayment = Number.parseFloat(
    e.target.dataset.nextPayment.split(" ")[0]
  );

  const billingPeriod = e.target.dataset.billingPeriod;

  const formatter = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  });

  const resizeSummary = document.getElementById(`resize-summary--${id}`);
  const newPayment = document.getElementById(`new-payment--${id}`);
  const updateButton = document.getElementById(`save-changes--${id}`);

  const { min, max } = e.target;

  if (newValue < min) {
    newValue = Number.parseInt(min);
    e.target.value = min;
  }

  if (newValue > max) {
    newValue = Number.parseInt(max);
    e.target.value = max;
  }

  if (newValue !== defaultValue) {
    resizeSummary.classList.remove("u-hide");
    newPayment.classList.remove("u-hide");
    updateButton.disabled = false;

    if (newValue > defaultValue) {
      resizeSummary.innerHTML = `Your changes will add UA for ${
        newValue - defaultValue
      } machines`;
      newPayment.innerHTML = `Your ${billingPeriod} payment will be <strong>increased by ${formatter.format(
        unitPrice * (newValue - defaultValue)
      )}, to ${formatter.format(
        unitPrice * (newValue - defaultValue) + nextPayment
      )} ${
        billingPeriod === "monthly"
          ? "per month</strong>."
          : `per year</strong>. <br/>A payment of ${formatter.format(
              unitPrice * (newValue - defaultValue)
            )} will be charged immediately`
      }`;
    } else {
      //Downsizing is only for monthly contracts
      resizeSummary.innerHTML = `Your changes will remove UA for ${
        defaultValue - newValue
      } machines`;
      newPayment.innerHTML = `Your monthly payment will be <strong>reduced by ${formatter.format(
        unitPrice * (defaultValue - newValue)
      )}, to ${formatter.format(
        unitPrice * (newValue - defaultValue) + nextPayment
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
  const updateButton = document.getElementById(`save-changes--${id}`);
  const cancelChangesButton = document.getElementById(`cancel-changes--${id}`);
  const cancelSubscriptionButton = document.getElementById(
    `cancel-subscription--${id}`
  );
  const resizeField = document.getElementById(`resize-input--${id}`);

  // Show edit options
  const previewSection = document.getElementById(`view-mode--${id}`);
  const editSection = document.getElementById(`edit-mode--${id}`);
  previewSection.classList.add("u-hide");
  editSection.classList.remove("u-hide");

  resizeField.oninput = (e) => {
    handleChange(e, id);
  };

  cancelChangesButton.onclick = () => {
    handleCancelChangesClick(id);
  };

  updateButton.onclick = () => {
    handleUpdateClick(id);
  };

  if (cancelSubscriptionButton) {
    cancelSubscriptionButton.onclick = () => {
      createModal(id);
    };
  }
}

const editButtons = document.querySelectorAll(".js-change-subscription-button");

editButtons.forEach((button) => {
  button.addEventListener("click", handleChangeClick);
});
