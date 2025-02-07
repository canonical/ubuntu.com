import { createRoot } from "react-dom/client";
import { SignFormProvider, useSignForm } from "./contexts/SignForm";
import { QueryParamProvider } from "use-query-params";
import { ReactRouter6Adapter } from "use-query-params/adapters/react-router-6";
import { BrowserRouter } from "react-router-dom";

import SuccessPage from "./pages/SuccessPage";
import SignPage from "./pages/SignPage";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

declare global {
  interface Window {
    CANONICAL_CLA_API_URL: string;
    COUNTRIES_LIST: {
      alpha2: string;
      name: string;
    }[];
  }
}
const CLAForm = () => {
  const { step } = useSignForm();
  return (
    <div className="row p-strip">
      <div className="col-8">
        <h1>Contributor agreement form</h1>
        {step === "sign" ? (
          <SignPage />
        ) : step === "success" ? (
          <SuccessPage />
        ) : null}
      </div>
    </div>
  );
};

const App = () => {
  const queryClient = new QueryClient();
  return (
    <BrowserRouter>
      <QueryParamProvider adapter={ReactRouter6Adapter}>
        <QueryClientProvider client={queryClient}>
          <SignFormProvider>
            <CLAForm />
          </SignFormProvider>
        </QueryClientProvider>
      </QueryParamProvider>
    </BrowserRouter>
  );
};

createRoot(document.getElementById("react-root")!).render(<App />);
