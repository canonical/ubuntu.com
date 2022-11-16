import React from "react";
import ReactDOM from "react-dom";
import * as Sentry from "@sentry/react";
import { QueryClient, QueryClientProvider } from "react-query";
import { Integrations } from "@sentry/tracing";
import { ReactQueryDevtools } from "react-query/devtools";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import CredManage from "./components/CredManage";
import CredShop from "./components/CredShop";
import CredRedeem from "./components/CredRedeem/CredRedeem";

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
        <Router basename="/credentialling/shop">
          <Routes>
            <Route path="/" element={<CredShop />} />
            <Route path="/redeem" element={<CredRedeem />} />
            <Route path="/cred-manage" element={<CredManage />} />
          </Routes>
        </Router>
        <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>
    </Sentry.ErrorBoundary>
  );
}

ReactDOM.render(<App />, document.getElementById("react-root"));
