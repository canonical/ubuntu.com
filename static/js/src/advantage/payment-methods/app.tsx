import * as Sentry from "@sentry/react";
import { createRoot } from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import type { InvoiceRow } from "./Invoices";
import type { PaymentMethodProps } from "./PaymentMethods";
import AccountRoutes from "./Routes";

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
  dsn: "https://624a17f6cb841af9f2c4b0998b8f30d2@o4510662863749120.ingest.de.sentry.io/4510709886419024",
  integrations: [Sentry.browserTracingIntegration()],
  allowUrls: ["ubuntu.com"],
});

const root = document.getElementById("account-pages-app");
if (root) {
  const accountId = root.dataset.accountId ?? "";
  const invoices = JSON.parse(root.dataset.invoices ?? "[]") as InvoiceRow[];
  const paymentMethodProps: PaymentMethodProps = {
    stripeKey: root.dataset.stripeKey ?? "",
    accountId,
    pendingPurchaseId: root.dataset.pendingPurchaseId ?? "",
    initialHasPaymentMethod: root.dataset.hasPaymentMethod === "true",
    cardBrand: root.dataset.cardBrand ?? "",
    cardLast4: root.dataset.cardLast4 ?? "",
  };
  const invoiceProps = {
    accountId,
    invoices,
    marketplace: root.dataset.marketplace ?? "",
    currentPage: Number(root.dataset.currentPage ?? "1"),
    totalPages: Number(root.dataset.totalPages ?? "1"),
  };

  createRoot(root).render(
    <Sentry.ErrorBoundary fallback={<p>An error has occurred</p>}>
      <QueryClientProvider client={queryClient}>
        <AccountRoutes
          paymentMethodProps={paymentMethodProps}
          invoiceProps={invoiceProps}
        />
        <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>
    </Sentry.ErrorBoundary>,
  );
}
