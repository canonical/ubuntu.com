import React from "react";
import ReactDOM from "react-dom";
import { QueryClient, QueryClientProvider } from "react-query";
import { ReactQueryDevtools } from "react-query/devtools";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import PurchaseModal from "./PurchaseModal";

const stripePromise = loadStripe(window.stripePublishableKey);

const oneHour = 1000 * 60 * 60;
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      refetchOnmount: false,
      refetchOnReconnect: false,
      staleTime: oneHour,
      retryOnMount: false,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Elements stripe={stripePromise}>
        <PurchaseModal />
      </Elements>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}

ReactDOM.render(<App />, document.getElementById("react-root"));
