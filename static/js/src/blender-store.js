import { debounce } from "./utils/debounce.js";

(function () {
  const cartContainer = /** @type {HTMLElement} */ (
    document.querySelector("#cart-container")
  );
  const cartTemplate = /** @type {HTMLTemplateElement} */ (
    document.querySelector("[data-template=cart]")
  );
  const mainCart = /** @type {HTMLElement} */ (
    document.querySelector(".p-shop-cart")
  );

  const STATE = {
    package: "standard",
    users: 0,
    billingPeriod: "annual",
  };

  function updateState(previousState, action) {
    if (action.type === "CHANGE_PACKAGE") {
      previousState.package = action.value;
    }

    if (action.type === "ADD_OR_REMOVE_USERS") {
      previousState.users = action.value;
    }

    if (action.type === "CHANGE_BILLING_PERIOD") {
      previousState.billingPeriod = action.value;
    }

    updateCartTemplate();
  }

  function setupEventHandlers() {
    const packageOptions = Array.prototype.slice.call(
      document.querySelectorAll(".js-radio"),
    );

    packageOptions.forEach((option) => {
      const optionRadio = option.querySelector("[type=radio]");

      option.addEventListener("click", () => {
        const previousSelectedOption = packageOptions.find((packageOption) => {
          return packageOption.classList.contains("is-selected");
        });

        optionRadio.checked = true;

        if (previousSelectedOption) {
          previousSelectedOption.classList.remove("is-selected");
        }

        option.classList.add("is-selected");
        updateState(STATE, {
          type: "CHANGE_PACKAGE",
          value: optionRadio.value,
        });
      });
    });

    const usersCount = /** @type {HTMLInputElement} */ (
      document.querySelector("#quantity-input")
    );

    usersCount.addEventListener(
      "input",
      debounce((e) => {
        updateState(STATE, {
          type: "ADD_OR_REMOVE_USERS",
          value: parseInt(usersCount.value),
        });

        if (STATE.users > 0) {
          mainCart.classList.remove("p-shop-cart--hidden");
        } else {
          mainCart.classList.add("p-shop-cart--hidden");
        }
      }, 50),
    );
  }

  function calculateTotalCost() {
    const cost = {
      standard: {
        monthly: 50,
        annual: 500,
      },
      advanced: {
        monthly: 100,
        annual: 1000,
      },
    };

    return STATE.users * cost[STATE.package][STATE.billingPeriod] || 0;
  }

  function updateCartTemplate() {
    const cart = cartTemplate.content.cloneNode(true);

    cartContainer.innerHTML = "";
    cartContainer.appendChild(cart);

    const userCount = /** @type {HTMLElement} */ (
      cartContainer.querySelector("[data-prop=user-count]")
    );
    userCount.innerText = STATE.users;

    const packageName = /** @type {HTMLElement} */ (
      cartContainer.querySelector("[data-prop=selected-package]")
    );
    packageName.innerText =
      STATE.package === "advanced"
        ? "Blender Support Advanced"
        : "Blender Support Standard";

    const billing = /** @type {HTMLInputElement} */ (
      cartContainer.querySelector("[data-prop=billing]")
    );
    billing.value = STATE.billingPeriod;

    const totalCost = /** @type {HTMLElement} */ (
      cartContainer.querySelector("[data-prop=total-cost]")
    );
    totalCost.innerText = parseInt(calculateTotalCost());

    const period = /** @type {HTMLElement} */ (
      cartContainer.querySelector("[data-prop=period]")
    );
    period.innerText = STATE.billingPeriod === "monthly" ? "month" : "year";

    const billingPeriod = /** @type {HTMLSelectElement} */ (
      document.querySelector("#billing-period")
    );

    billingPeriod.addEventListener("change", () => {
      updateState(STATE, {
        type: "CHANGE_BILLING_PERIOD",
        value: billingPeriod.value,
      });
    });
  }

  setupEventHandlers();
  updateCartTemplate();
})();
