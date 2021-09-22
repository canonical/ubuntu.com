import React from "react";
import ReactDOM from "react-dom";
import { QueryClient, QueryClientProvider } from "react-query";
import { ReactQueryDevtools } from "react-query/devtools";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";

import { useLoadWindowData } from "./hooks";
import Subscriptions from "./components/Subscriptions";
import { StripePublishableKey } from "advantage/api/types";

declare global {
  interface Window {
    // This key is added to the window in the template.
    stripePublishableKey?: StripePublishableKey;
  }
}

const stripePromise = window.stripePublishableKey
  ? loadStripe(window.stripePublishableKey)
  : null;
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

export const App = () => {
  useLoadWindowData(queryClient);
  return (
    <QueryClientProvider client={queryClient}>
      <Elements stripe={stripePromise}>
        <Subscriptions />
      </Elements>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
};

const appRoot = document.getElementById("react-root");
if (appRoot) {
  ReactDOM.render(<App />, appRoot);
}
