import React from "react";
import ReactDOM from "react-dom";
import { QueryClient, QueryClientProvider } from "react-query";
import { ReactQueryDevtools } from "react-query/devtools";
import * as Sentry from "@sentry/react";
import { Integrations } from "@sentry/tracing";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import BlenderPurchase from "./BlenderPurchase";
import { FormProvider } from "./utils/FormContext";
import { ProductListings } from "./utils/utils";

declare global {
  interface Window {
    stripePublishableKey?: string;
    isLoggedIn?: boolean;
    accountId?: string;
    tempAccountId?: string;
    previousPurchaseIds?: { monthly: string; yearly: string };
    handleTogglePurchaseModal?: () => void;
    blenderProductList: ProductListings;
  }
}

Sentry.init({
  dsn: "https://0293bb7fc3104e56bafd2422e155790c@sentry.is.canonical.com//13",
  integrations: [
    new Integrations.BrowserTracing({
      tracingOrigins: ["ubuntu.com"],
    }),
  ],
  allowUrls: ["ubuntu.com"],
  tracesSampleRate: 1.0,
});

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

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <FormProvider>
        <Elements stripe={stripePromise}>
          <BlenderPurchase />
        </Elements>
      </FormProvider>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}

ReactDOM.render(<App />, document.getElementById("react-root"));
