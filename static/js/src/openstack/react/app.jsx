import ReactDOM from "react-dom";
import React from "react";
import { createRoot } from "react-dom/client";
import CostCalculatorForm from "./components/CostCalculatorForm";

const container = document.getElementById("cost-calculator-section");

if (!container) {
  throw new Error("Failed to find the root element");
}
const root = createRoot(container);

function App() {
  return <CostCalculatorForm />;
}

root.render(<App />);
