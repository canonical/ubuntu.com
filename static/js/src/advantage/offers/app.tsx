import React from "react";
import ReactDOM from "react-dom";
import * as Sentry from "@sentry/react";
import { QueryClient, QueryClientProvider } from "react-query";
import { Integrations } from "@sentry/tracing";
import { ReactQueryDevtools } from "react-query/devtools";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";

import Offers from "./Offers";

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

Sentry.init({
  dsn: "https://0293bb7fc3104e56bafd2422e155790c@sentry.is.canonical.com//13",
  integrations: [
    new Integrations.BrowserTracing({
      tracingOrigins: ["ubuntu.com"],
    }),
  ],
  allowUrls: ["ubuntu.com"],
});

function App() {
  return (
    <Sentry.ErrorBoundary>
      <Elements stripe={stripePromise}>
        <QueryClientProvider client={queryClient}>
          <Offers />
          <ReactQueryDevtools initialIsOpen={false} />
        </QueryClientProvider>
      </Elements>
    </Sentry.ErrorBoundary>
  );
}

ReactDOM.render(<App />, document.getElementById("advantage-offers-app"));
