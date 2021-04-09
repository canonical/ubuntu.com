import renderForm from "./form-renderer";
import renderUI from "./UI-renderer";
import renderPurchaseModal from "./purchase-modal-renderer";

export default function render(state) {
  renderForm(state.form);
  renderUI(state.ui);
  renderPurchaseModal(state);
}
