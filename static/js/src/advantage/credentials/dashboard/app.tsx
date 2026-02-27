import { createRoot } from "react-dom/client";
import * as Sentry from "@sentry/react";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import QueryClient from "./components/QueryClient/QueryClient";
import Routes from "./components/Routes/Routes";
import Sidebar from "./components/Sidebar/Sidebar";
import { BrowserRouter as Router } from "react-router-dom";

Sentry.init({
  dsn: "https://624a17f6cb841af9f2c4b0998b8f30d2@o4510662863749120.ingest.de.sentry.io/4510709886419024",
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
