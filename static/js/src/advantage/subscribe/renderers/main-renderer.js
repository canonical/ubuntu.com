import renderForm from "./form-renderer";
import renderUI from "./UI-renderer";

export default function render(state) {
  renderForm(state.form);
  renderUI(state.ui);
}
