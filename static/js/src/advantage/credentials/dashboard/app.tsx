import React from "react";
import { useState, useMemo } from "react";
import ReactDOM from "react-dom";
import * as Sentry from "@sentry/react";
import { QueryClient, QueryClientProvider } from "react-query";
import { Integrations } from "@sentry/tracing";
import { ReactQueryDevtools } from "react-query/devtools";
import { Tabs, Strip } from "@canonical/react-components";
import UpcomingExams from "./components/UpcomingExams/UpcomingExams";
import ExamResults from "./components/ExamResults/ExamResults";
// import Keys from "./components/Keys/Keys";

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
  const [activeTab, setActiveTab] = useState(0);
  const tabs = useMemo(() => {
    return [
      {
        active: activeTab === 0,
        label: "Upcoming Exams",
        onClick: () => setActiveTab(0),
      },
      {
        active: activeTab === 1,
        label: "Exam Results",
        onClick: () => setActiveTab(1),
      },
      {
        active: activeTab === 2,
        label: "Keys",
        onClick: () => setActiveTab(2),
      },
    ];
  }, [activeTab]);

  return (
    <Sentry.ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <ReactQueryDevtools initialIsOpen={false} />
        <Strip>
          <p className="p-heading--1">Dashboard</p>
          <Tabs links={tabs} />
          <UpcomingExams hidden={activeTab !== 0} />
          <ExamResults hidden={activeTab !== 1} />
          {/* <Keys hidden={activeTab !== 2} /> */}
        </Strip>
      </QueryClientProvider>
    </Sentry.ErrorBoundary>
  );
}

ReactDOM.render(<App />, document.getElementById("credentials-dashboard-app"));
