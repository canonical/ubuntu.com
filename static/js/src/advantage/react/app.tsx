import * as Sentry from "@sentry/react";
import { createRoot } from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
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

Sentry.init({
  dsn: "https://0293bb7fc3104e56bafd2422e155790c@sentry.is.canonical.com//13",
  integrations: [Sentry.browserTracingIntegration()],
  allowUrls: ["ubuntu.com"],
  tracesSampleRate: 1.0,
});

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

const container = document.getElementById("react-root");

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

if (container){
  const root = createRoot(container);
  root.render(<App />);
}
