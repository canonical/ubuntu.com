import { createRoot } from "react-dom/client";
import CostCalculatorForm from "./components/CostCalculatorForm";

function App() {
  return <CostCalculatorForm />;
}

createRoot(document.getElementById("cost-calculator-section")).render(<App />);
