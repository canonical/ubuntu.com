import React from "react";
import ReactDOM from "react-dom";
import { QueryClient, QueryClientProvider } from "react-query";
import MicrocertificationsTable from "./components/MicrocertificationsTable";
import useMicrocertsData from "./hooks/useMicrocertsData";

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

const MicrocertsApApp = () => {
  const { modules, studyLabs, isLoading, isError } = useMicrocertsData();
  const defaultErrorMessage = "An error occurred while loading the microcerts";

  return (
    <section className="p-strip">
      <div className="u-fixed-width">
        <h2>Microcertifications</h2>
        <MicrocertificationsTable
          modules={modules}
          studyLabs={studyLabs}
          isLoading={isLoading}
          error={isError ? defaultErrorMessage : ""}
        />
      </div>
    </section>
  );
};

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <MicrocertsApApp />
    </QueryClientProvider>
  );
};

ReactDOM.render(
  <App />,
  document.getElementById("micro-certification-table-app")
);
