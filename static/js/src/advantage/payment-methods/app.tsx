import * as Sentry from "@sentry/react";
import { createRoot } from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import type { PaymentMethodProps } from "./PaymentMethods";
import AccountRoutes from "./Routes";

const Mins_5 = 1000 * 60 * 5;
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: true,
      refetchOnMount: true,
      staleTime: Mins_5,
    },
  },
});

Sentry.init({
  dsn: "https://624a17f6cb841af9f2c4b0998b8f30d2@o4510662863749120.ingest.de.sentry.io/4510709886419024",
  integrations: [Sentry.browserTracingIntegration()],
  allowUrls: ["ubuntu.com"],
});

type AccountPageData = Partial<PaymentMethodProps>;

declare global {
  interface Window {
    APP_CONFIG?: AccountPageData;
  }
}

const root = document.getElementById("account-pages-app");
if (root) {
  const data = window.APP_CONFIG ?? {};
  const accountId = data.accountId ?? "";
  const paymentMethodProps: PaymentMethodProps = {
    stripeKey: data.stripeKey ?? "",
    accountId,
    pendingPurchaseId: data.pendingPurchaseId ?? "",
    initialHasPaymentMethod: data.initialHasPaymentMethod ?? false,
    cardBrand: data.cardBrand ?? "",
    cardLast4: data.cardLast4 ?? "",
  };
  createRoot(root).render(
    <Sentry.ErrorBoundary fallback={<p>An error has occurred</p>}>
      <QueryClientProvider client={queryClient}>
        <AccountRoutes paymentMethodProps={paymentMethodProps} />
        <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>
    </Sentry.ErrorBoundary>,
  );
}
