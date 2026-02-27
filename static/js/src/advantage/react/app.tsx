import * as Sentry from "@sentry/react";
import { createRoot } from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";

import { useLoadWindowData } from "./hooks";
import Subscriptions from "./components/Subscriptions";
import { StripePublishableKey } from "advantage/api/types";
import HeaderStrip from "./components/Subscriptions/HeaderStrip";

declare global {
  interface Window {
    // This key is added to the window in the template.
    stripePublishableKey?: StripePublishableKey;
  }
}

Sentry.init({
  dsn: "https://624a17f6cb841af9f2c4b0998b8f30d2@o4510662863749120.ingest.de.sentry.io/4510709886419024",
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

export const App = () => {
  useLoadWindowData(queryClient);
  return (
    <QueryClientProvider client={queryClient}>
      <Elements stripe={stripePromise}>
        <HeaderStrip />
        <Subscriptions />
      </Elements>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
};
const root = document.getElementById("react-root");
if (root) {
  createRoot(root).render(<App />);
}
