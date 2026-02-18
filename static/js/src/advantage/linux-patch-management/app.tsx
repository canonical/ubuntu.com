import * as Sentry from "@sentry/react";
import { createRoot } from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import CVETable from "./components/CVETable";

Sentry.init({
  dsn: "https://624a17f6cb841af9f2c4b0998b8f30d2@o4510662863749120.ingest.de.sentry.io/4510709886419024",
  integrations: [Sentry.browserTracingIntegration()],
  allowUrls: ["ubuntu.com"],
  tracesSampleRate: 1.0,
});

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

export const CVETableApp = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <CVETable />
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
};
const cve_table_root = document.getElementById("cve-table-root");
if (cve_table_root) {
  createRoot(cve_table_root).render(<CVETableApp />);
}
