import React from "react";
import { render, screen } from "@testing-library/react";
import "whatwg-fetch";

import MicrocertificationsTable from "./MicrocertificationsTable";
import { server } from "../../../../../../tests/mocks/server";

const validStatuses = [
  "Enrolled",
  "Not Enrolled",
  "Passed",
  "Failed",
  "In Progress",
];

// Configure server for mocking endpoints
beforeAll(() => server.listen({ onUnhandledRequest: "warn" }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe("MicrocertificationsTable", () => {
  it("renders enrollment statuses", async () => {
    render(<MicrocertificationsTable />);

    const statusCells = await screen.findAllByLabelText("Status");
    statusCells.forEach((statusCell, index) => {
      expect(statusCell).toHaveTextContent(validStatuses[index]);
    });
  });
});
