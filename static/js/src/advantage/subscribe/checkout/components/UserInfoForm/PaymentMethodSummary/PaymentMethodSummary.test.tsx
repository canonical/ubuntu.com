import React from "react";
import { QueryClient, QueryClientProvider } from "react-query";
import { render, screen } from "@testing-library/react";
import { userInfo } from "../../../utils/test/Mocks";
import PaymentMethodSummary from "./PaymentMethodSummary";

describe("PaymentMethodSummary", () => {
  let queryClient: QueryClient;

  beforeEach(async () => {
    queryClient = new QueryClient();
  });

  it("renders correctly", () => {
    queryClient.setQueryData("customerInfo", userInfo);

    render(
      <QueryClientProvider client={queryClient}>
        <PaymentMethodSummary />
      </QueryClientProvider>
    );
    screen.getByText("ending in 4444");
    expect(screen.getByText("mastercard")).toBeInTheDocument();
    expect(screen.getByText("ending in 4444")).toBeInTheDocument();
    expect(screen.getByText("04/44")).toBeInTheDocument();
  });
});
