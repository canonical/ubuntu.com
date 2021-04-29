import RenderForm from "./form-renderer";
import RenderUI from "./UI-renderer";

export default function render(state) {
  RenderForm(state.form);
  RenderUI(state.ui);
}
