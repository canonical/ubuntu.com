// import { debounce } from "../../../utils/debounce.js";
// import { formatter } from "../renderers/form-renderer";

// window.STATE = {
//   package: "standard",
//   period: "yearly",
//   quantity: 1,
//   product: {},
// };

// const mainCart = document.querySelector(".p-shop-cart");
// const purchaseModal = document.querySelector("#purchase-modal");
// const userCount = document.querySelector("[data-prop=user-count]");
// const packageName = document.querySelector("[data-prop=selected-package]");
// const billingPeriod = document.querySelector("[data-prop=billing]");
// const totalCost = document.querySelector("[data-prop=total-cost]");
// const costSummaryPeriod = document.querySelector("[data-prop=period]");
// const buyNowButton = document.querySelector("#buy-now-button");
// const productsArray = Object.entries(window.productList);
// let hasMonthly = false;

// productsArray.forEach((product) => {
//   if (product[1].period === "monthly") {
//     hasMonthly = true;
//   }
// });

// if (hasMonthly) {
//   billingPeriod.classList.remove("u-hide");
// }

// function handlePackageChange() {
//   const packageOptions = Array.prototype.slice.call(
//     document.querySelectorAll(".js-radio")
//   );

//   packageOptions.forEach((option) => {
//     const optionRadio = option.querySelector("[type=radio]");

//     option.addEventListener("click", () => {
//       const previousSelectedOption = packageOptions.find((packageOption) => {
//         return packageOption.classList.contains("is-selected");
//       });

//       if (previousSelectedOption) {
//         previousSelectedOption.classList.remove("is-selected");
//       }

//       optionRadio.checked = true;
//       option.classList.add("is-selected");

//       updateState({
//         type: "CHANGE_PACKAGE",
//         value: optionRadio.value,
//       });

//       mainCart.classList.remove("p-shop-cart--hidden");
//     });
//   });
// }

// function handleQuantityChange() {
//   const quantity = document.querySelector("#quantity-input");

//   quantity.addEventListener(
//     "input",
//     debounce((e) => {
//       const newValue = parseInt(e.target.value);
//       updateState({
//         type: "ADD_OR_REMOVE_USERS",
//         value: newValue > 0 ? newValue : 1,
//       });
//       if (newValue < 1 || e.target.value.includes("e")) {
//         e.target.value = 1;
//       }
//     }, 50)
//   );
// }

// function handleBillingPeriodChange() {
//   billingPeriod.addEventListener("change", (e) => {
//     updateState({
//       type: "CHANGE_BILLING_PERIOD",
//       value: e.target.value,
//     });
//   });
// }

// function handleModalOpen() {
//   buyNowButton.addEventListener("click", (e) => {
//     e.preventDefault();
//     purchaseModal.classList.remove("u-hide");
//   });
// }

// function updateState(action) {
//   if (action.type === "CHANGE_PACKAGE") {
//     window.STATE.package = action.value;
//     setProduct(action.value, window.STATE.period);
//   }

//   if (action.type === "ADD_OR_REMOVE_USERS") {
//     window.STATE.quantity = action.value;
//   }

//   if (action.type === "CHANGE_BILLING_PERIOD") {
//     window.STATE.period = action.value;
//     setProduct(window.STATE.package, action.value);
//   }

//   updateCart();
// }

// function setProduct(supportType, period) {
//   const products = Object.entries(window.productList);

//   window.STATE.product = products.find((product) => {
//     return product[1].productID === supportType && product[1].period === period;
//   })[1];
// }

// function updateCart() {
//   userCount.innerText = window.STATE.quantity;
//   packageName.innerText = window.STATE.product.name;
//   billingPeriod.value = window.STATE.period;
//   totalCost.innerText = calculateTotalCost();
//   costSummaryPeriod.innerText =
//     window.STATE.period === "monthly" ? "month" : "year";
//   buyNowButton.dataset.product = JSON.stringify(window.STATE.product);
//   buyNowButton.dataset.quantity = window.STATE.quantity;
// }

// function calculateTotalCost() {
//   return formatter.format(
//     (parseInt(window.STATE.quantity) *
//       parseInt(window.STATE.product?.price?.value)) /
//       100
//   );
// }

// handlePackageChange();
// handleQuantityChange();
// handleBillingPeriodChange();
// handleModalOpen();
