import { createRoot } from "react-dom/client";
import * as Sentry from "@sentry/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import Exams from "./routes/Exams";
import Credly from "./routes/Credly";
import Keys from "./routes/Keys";

import UpcomingExams from "./components/UpcomingExams/UpcomingExams";
import ExamResults from "./components/ExamResults/ExamResults";
import KeysList from "./components/KeysList/KeysList";
import TestTakers from "./components/TestTakers/TestTakers";
import CertificationIssued from "./components/CertificationsIssued/CertificationIssued";
import BadgeTracking from "./components/BadgeTracking/BadgeTracking";
import Sidebar from "./components/Sidebar/Sidebar";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

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
  integrations: [Sentry.browserTracingIntegration()],
  allowUrls: ["ubuntu.com"],
});

function App() {
  return (
    <Router basename="/credentials/dashboard">
      <Sentry.ErrorBoundary>
        <QueryClientProvider client={queryClient}>
          <ReactQueryDevtools initialIsOpen={false} />
          <div className="l-application">
            <Sidebar />
            <main className="l-main">
              <section style={{ padding: "2rem" }}>
                <Routes>
                  <Route path="/" element={<Navigate to="/exams" />} />
                  <Route path="/exams" element={<Exams />}>
                    <Route path="/exams/upcoming" element={<UpcomingExams />} />
                    <Route path="/exams/results" element={<ExamResults />} />
                  </Route>
                  <Route path="/keys" element={<Keys />}>
                    <Route path="/keys/list" element={<KeysList />} />
                  </Route>
                  <Route path="/credly" element={<Credly />}>
                    <Route
                      path="/credly/issued"
                      element={<CertificationIssued />}
                    />
                    <Route
                      path="/credly/badge-tracking"
                      element={<BadgeTracking />}
                    />
                  </Route>
                  <Route path="/test-taker-stats" element={<TestTakers />} />
                </Routes>
              </section>
            </main>
          </div>
        </QueryClientProvider>
      </Sentry.ErrorBoundary>
    </Router>
  );
}

createRoot(document.getElementById("credentials-dashboard-app")!).render(
  <App />
);
