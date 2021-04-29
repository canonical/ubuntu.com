const form = document.querySelector(".js-shop-form");

function renderModal(state) {
  const modal = form.querySelector("#other-versions-modal");
  if (state.otherVersionsModal.show) {
    modal.style.display = "flex";
    modal.focus();
  } else {
    modal.style.display = "none";
  }
}

export default function render(state) {
  renderModal(state);
}
