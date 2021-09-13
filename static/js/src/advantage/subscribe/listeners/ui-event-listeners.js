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

  // Add close modal function to window object so the React modal can use it
  window.closeModal = () => {
    store.dispatch(togglePurchaseModal());
  };

  const buyButton = document.querySelector("#buy-now-button");

  buyButton.addEventListener("click", (e) => {
    e.preventDefault();
    store.dispatch(togglePurchaseModal());
  });
}
