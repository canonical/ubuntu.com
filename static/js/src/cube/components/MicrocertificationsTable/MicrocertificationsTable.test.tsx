import React from "react";
import { QueryClient, QueryClientProvider } from "react-query";
import { render, screen } from "@testing-library/react";
import "whatwg-fetch";
import MicrocertificationsTable from "./MicrocertificationsTable";
import useMicrocertsData from "../../hooks/useMicrocertsData";
import { server } from "../../../../../../tests/mocks/server";

const validStatuses = [
  "Enrolled",
  "Not Enrolled",
  "Passed",
  "Failed",
  "In Progress",
];

const App = () => {
  const { modules, studyLabs, isLoading, isError } = useMicrocertsData();
  const defaultErrorMessage = "An error occurred while loading the microcerts";

  return (
    <MicrocertificationsTable
      modules={modules}
      studyLabs={studyLabs}
      isLoading={isLoading}
      error={isError ? defaultErrorMessage : ""}
    />
  );
};

describe("MicrocertificationsTable", () => {
  let queryClient: QueryClient;

  // Configure server for mocking endpoints
  beforeAll(() => {
    queryClient = new QueryClient();
    server.listen({ onUnhandledRequest: "warn" });
  });
  afterEach(() => server.resetHandlers());
  afterAll(() => server.close());

  it("renders enrollment statuses", async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <App />
      </QueryClientProvider>
    );

    const statusCells = await screen.findAllByLabelText("Status");
    statusCells.forEach((statusCell, index) => {
      expect(statusCell).toHaveTextContent(validStatuses[index]);
    });
  });
});
