import React from "react";
import { QueryClient, QueryClientProvider } from "react-query";
import { render, screen } from "@testing-library/react"; // (or /dom, /vue, ...)

import OffersList from "./OffersList";
import { OfferFactory } from "../../tests/factories/offers";

describe("OffersList", () => {
  let queryClient: QueryClient;

  beforeEach(async () => {
    queryClient = new QueryClient();
  });

  it("can display no offers", () => {
    queryClient.setQueryData("Offers", []);
    render(
      <QueryClientProvider client={queryClient}>
        <OffersList />
      </QueryClientProvider>
    );
    expect(
      screen.getByText("You have no offers available.")
    ).toBeInTheDocument();
  });

  it("can display an offer", () => {
    queryClient.setQueryData("Offers", [OfferFactory.build({ id: "1" })]);
    render(
      <QueryClientProvider client={queryClient}>
        <OffersList />
      </QueryClientProvider>
    );
    expect(screen.getAllByTestId("offer-card").length).toBe(1);
  });

  it("can display multiple offers", () => {
    queryClient.setQueryData("Offers", [
      OfferFactory.build({ id: "1" }),
      OfferFactory.build({ id: "2" }),
    ]);
    render(
      <QueryClientProvider client={queryClient}>
        <OffersList />
      </QueryClientProvider>
    );
    expect(screen.getAllByTestId("offer-card").length).toBe(2);
  });
});
