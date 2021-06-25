import {
  toggleOtherVersionsModal,
  togglePurchaseModal,
} from "../reducers/ui-reducer";

const form = document.querySelector(".js-shop-form");

export default function initUIControls(store) {
  const otherVersionToggles = form.querySelectorAll(
    "[aria-controls='other-versions-modal']"
  );
  otherVersionToggles.forEach((toggle) => {
    toggle.addEventListener("click", (e) => {
      e.preventDefault();
      store.dispatch(toggleOtherVersionsModal());
    });
  });

  // Find every "purchase-modal" control (buy button and cancel button)
  // and make them toggle the display of the purchase modal when clicked

  const purchaseModalToggles = document.querySelectorAll(
    "[aria-controls='purchase-modal']"
  );
  purchaseModalToggles.forEach((toggle) => {
    toggle.addEventListener("click", (e) => {
      e.preventDefault();
      store.dispatch(togglePurchaseModal());
    });
  });
}
