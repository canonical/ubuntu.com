import React from "react";
import { renderHook } from "@testing-library/react-hooks";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  selectPurchaseIdsByMarketplaceAndPeriod,
  useLastPurchaseIds,
} from "./useLastPurchaseIds";

import { lastPurchaseIdsFactory } from "advantage/tests/factories/api";
import {
  UserSubscriptionPeriod,
  UserSubscriptionMarketplace,
} from "advantage/api/enum";

const createWrapper = (queryClient: QueryClient) => {
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe("useLastPurchaseIds", () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient();
  });

  it("can return the last purchase ids from the store", async () => {
    const lastPurchaseIds = lastPurchaseIdsFactory.build();
    queryClient.setQueryData(
      ["lastPurchaseIds", "account123"],
      lastPurchaseIds,
    );
    const wrapper = createWrapper(queryClient);
    const { result, waitForNextUpdate } = renderHook(
      () => useLastPurchaseIds("account123"),
      { wrapper },
    );
    await waitForNextUpdate();
    expect(result.current.data).toStrictEqual(lastPurchaseIds);
  });

  it("can return last purchase id for a given period and marketplace", async () => {
    const lastPurchaseIds = lastPurchaseIdsFactory.build({
      [UserSubscriptionMarketplace.CanonicalUA]: {
        monthly: "monthly123",
      },
    });
    queryClient.setQueryData(
      ["lastPurchaseIds", "account123"],
      lastPurchaseIds,
    );
    const wrapper = createWrapper(queryClient);
    const { result, waitForNextUpdate } = renderHook(
      () =>
        useLastPurchaseIds("account123", {
          select: selectPurchaseIdsByMarketplaceAndPeriod(
            UserSubscriptionMarketplace.CanonicalUA,
            UserSubscriptionPeriod.Monthly,
          ),
        }),
      { wrapper },
    );
    await waitForNextUpdate();
    expect(result.current.data).toStrictEqual("monthly123");
  });
});
