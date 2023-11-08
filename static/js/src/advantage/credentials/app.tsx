import React from "react";
import ReactDOM from "react-dom";
import * as Sentry from "@sentry/react";
import { QueryClient, QueryClientProvider } from "react-query";
import { Integrations } from "@sentry/tracing";
import { ReactQueryDevtools } from "react-query/devtools";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import CredManage from "./components/CredManage";
import CredKeyShop from "./components/CredKeyShop";
import CredPurchaseConfirmation from "./components/CredPurchaseConfirmation/CredPurchaseConfirmation";
import CredExamShop from "./components/CredExamShop/CredExamShop";
import CredWebhookResponses from "./components/CredWebhookResponses";

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
      <QueryClientProvider client={queryClient}>
        <Router basename="/credentials/shop">
          <Routes>
            <Route path="/" element={<CredExamShop />} />
            <Route path="/keys" element={<CredKeyShop />} />
            <Route path="/manage" element={<CredManage />} />
            <Route
              path="/order-thank-you"
              element={<CredPurchaseConfirmation />}
            />
            <Route
              path="/webhook_responses"
              element={<CredWebhookResponses />}
            />
          </Routes>
        </Router>
        <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>
    </Sentry.ErrorBoundary>
  );
}

ReactDOM.render(<App />, document.getElementById("react-root"));
