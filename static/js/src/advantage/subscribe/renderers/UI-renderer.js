const form = document.querySelector(".js-shop-form");

function renderModals(state) {
  const otherVersionsModal = form.querySelector("#other-versions-modal");
  const purchaseModal = document.querySelector("#purchase-modal");

  if (state.otherVersionsModal.show) {
    otherVersionsModal.style.display = "flex";
    otherVersionsModal.focus();
  } else {
    otherVersionsModal.style.display = "none";
  }

  if (state.purchaseModal.show) {
    purchaseModal.style.display = "flex";
    purchaseModal.focus();
  } else {
    purchaseModal.style.display = "none";
  }
}

export default function render(state) {
  renderModals(state);
}
