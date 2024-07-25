import { createRoot } from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import * as Sentry from "@sentry/react";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import UAPurchase from "./UAPurchase";
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
    productList: ProductListings;
  }
}

Sentry.init({
  dsn: "https://0293bb7fc3104e56bafd2422e155790c@sentry.is.canonical.com//13",
  integrations: [Sentry.browserTracingIntegration()],
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
          <UAPurchase />
        </Elements>
      </FormProvider>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}

createRoot(document.getElementById("react-root")!).render(<App />);
