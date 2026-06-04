import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor } from "@testing-library/react";
import ChannelOffersList from "./ChannelOffersList";
import { ChannelOfferFactory } from "advantage/offers/tests/factories/channelOffers";

describe("Test ChannelOffersList", () => {
  let queryClient: QueryClient;

  beforeEach(async () => {
    queryClient = new QueryClient();
  });

  it("Should display no offers", () => {
    queryClient.setQueryData(["channelOffers"], []);
    render(
      <QueryClientProvider client={queryClient}>
        <ChannelOffersList />
      </QueryClientProvider>,
    );
    expect(
      screen.getByText("You have no offers available."),
    ).toBeInTheDocument();
  });

  it("Should display an offer", () => {
    queryClient.setQueryData(
      ["channelOffers"],
      [ChannelOfferFactory.build({ id: "1" })],
    );
    render(
      <QueryClientProvider client={queryClient}>
        <ChannelOffersList />
      </QueryClientProvider>,
    );

    expect(
      screen.getByRole("columnheader", { name: /Opp ID/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("columnheader", { name: /Opp number/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("columnheader", { name: /Creator/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("columnheader", { name: /Technical user/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("columnheader", { name: /Customer/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("columnheader", { name: /Created/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("columnheader", { name: /Status/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("columnheader", { name: /Actions/i }),
    ).toBeInTheDocument();
  });

  it("Should display table headers", () => {
    queryClient.setQueryData(
      ["channelOffers"],
      [ChannelOfferFactory.build({ id: "1" })],
    );
    render(
      <QueryClientProvider client={queryClient}>
        <ChannelOffersList />
      </QueryClientProvider>,
    );
    expect(screen.getByTestId("channel-offer-table")).toBeInTheDocument();
  });

  it("can display multiple offers", async () => {
    queryClient.setQueryData(
      ["channelOffers"],
      [
        ChannelOfferFactory.build({
          id: "1",
          channel_deal_creator_name: "Test 1",
        }),
        ChannelOfferFactory.build({
          id: "2",
          channel_deal_creator_name: "Test 2",
        }),
      ],
    );

    render(
      <QueryClientProvider client={queryClient}>
        <ChannelOffersList />
      </QueryClientProvider>,
    );

    expect(screen.getByTestId("channel-offer-table")).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText("Test 1")).toBeInTheDocument();
      expect(screen.getByText("Test 2")).toBeInTheDocument();
    });
  });

  it("Shouuld display all columns properly", () => {
    queryClient.setQueryData(
      ["channelOffers"],
      [
        ChannelOfferFactory.build({
          id: "1",
          opportunity_number: "12345678",
          channel_deal_creator_name: "Test Deal creator name 1",
          end_user_account_name: "Test end user 1",
          reseller_account_name: "Test reseller account 1",
          created_at: "14 Aug 2024 00:00:00 UTC",
          actionable: true,
          external_ids: [
            {
              ids: ["zift-id-test-1"],
              origin: "Zift",
            },
          ],
        }),
      ],
    );
    render(
      <QueryClientProvider client={queryClient}>
        <ChannelOffersList />
      </QueryClientProvider>,
    );
    expect(screen.getByText("12345678")).toBeInTheDocument();
    expect(screen.getByText("Test Deal creator name 1")).toBeInTheDocument();
    expect(screen.getByText("Test reseller account 1")).toBeInTheDocument();
    expect(screen.getByText("14 Aug 2024")).toBeInTheDocument();
    expect(screen.getByText("Valid")).toBeInTheDocument();
    expect(screen.getByText("zift-id-test-1")).toBeInTheDocument();
  });

  it("If data is missing, show '-'", () => {
    queryClient.setQueryData(
      ["channelOffers"],
      [
        ChannelOfferFactory.build({
          id: "1",
          channel_deal_creator_name: null,
          end_user_account_name: "End user 1",
        }),
      ],
    );
    render(
      <QueryClientProvider client={queryClient}>
        <ChannelOffersList />
      </QueryClientProvider>,
    );
    expect(screen.getByText("-")).toBeInTheDocument;
    expect(screen.getByText("End user 1")).toBeInTheDocument();
  });
});
