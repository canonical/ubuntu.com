import { createRoot } from "react-dom/client";
import * as Sentry from "@sentry/react";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import QueryClient from "./components/QueryClient/QueryClient";
import Routes from "./components/Routes/Routes";
import Sidebar from "./components/Sidebar/Sidebar";
import { BrowserRouter as Router } from "react-router-dom";

Sentry.init({
  dsn: "https://0293bb7fc3104e56bafd2422e155790c@sentry.is.canonical.com//13",
  integrations: [Sentry.browserTracingIntegration()],
  allowUrls: ["ubuntu.com"],
});

function App() {
  return (
    <Router basename="/credentials/dashboard">
      <Sentry.ErrorBoundary>
        <QueryClient>
          <ReactQueryDevtools initialIsOpen={false} />
          <div className="l-application">
            <Sidebar />
            <main className="l-main">
              <section style={{ padding: "2rem" }}>
                <Routes />
              </section>
            </main>
          </div>
        </QueryClient>
      </Sentry.ErrorBoundary>
    </Router>
  );
}

createRoot(document.getElementById("credentials-dashboard-app")!).render(
  <App />,
);
