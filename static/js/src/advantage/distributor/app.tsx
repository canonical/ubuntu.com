import * as Sentry from "@sentry/react";
import { createRoot } from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Distributor from "./Distributor";
import DistributorShop from "./DistributorShop";
import { FormProvider } from "./utils/FormContext";
import { ProductListings } from "./utils/utils";

const stripePromise = loadStripe(window.stripePublishableKey ?? "");

const oneHour = 1000 * 60 * 60;
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      refetchOnMount: false,
      refetchOnReconnect: false,
      staleTime: oneHour,
      retryOnMount: false,
    },
  },
});

declare global {
  interface Window {
    stripePublishableKey?: string;
    isLoggedIn?: boolean;
    accountId?: string;
    tempAccountId?: string;
    channelProductList: ProductListings;
  }
}

Sentry.init({
  dsn: "https://0293bb7fc3104e56bafd2422e155790c@sentry.is.canonical.com//13",
  integrations: [Sentry.browserTracingIntegration()],
  allowUrls: ["ubuntu.com"],
});

export const App = () => {
  return (
    <Sentry.ErrorBoundary fallback={<p>An error has occurred</p>}>
      <Elements stripe={stripePromise}>
        <QueryClientProvider client={queryClient}>
          <FormProvider>
            <Router basename="/pro/distributor">
              <Routes>
                <Route path="/" element={<Distributor />} />
                <Route path="/shop" element={<DistributorShop />} />
              </Routes>
            </Router>
          </FormProvider>
          <ReactQueryDevtools initialIsOpen={false} />
        </QueryClientProvider>
      </Elements>
    </Sentry.ErrorBoundary>
  );
};

createRoot(document.getElementById("react-root")!).render(<App />);
