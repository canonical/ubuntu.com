import React from "react";
import { renderHook } from "@testing-library/react-hooks";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useResizeContract } from "./useResizeContract";

import * as contracts from "advantage/api/contracts";
import {
  lastPurchaseIdsFactory,
  userSubscriptionFactory,
} from "advantage/tests/factories/api";
import { LastPurchaseIds, UserSubscription } from "advantage/api/types";
import {
  UserSubscriptionMarketplace,
  UserSubscriptionPeriod,
} from "advantage/api/enum";

const createWrapper = (queryClient: QueryClient) => {
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe("useResizeContract", () => {
  let resizeContractSpy: jest.SpyInstance;
  let queryClient: QueryClient;
  let subscription: UserSubscription;
  let lastPurchaseIds: LastPurchaseIds;

  beforeEach(() => {
    resizeContractSpy = jest.spyOn(contracts, "resizeContract");
    resizeContractSpy.mockImplementation(() => Promise.resolve({}));
    lastPurchaseIds = lastPurchaseIdsFactory.build();
    subscription = userSubscriptionFactory.build({
      period: UserSubscriptionPeriod.Yearly,
    });
    queryClient = new QueryClient();
    queryClient.setQueryData(["userSubscriptions"], [subscription]);
    queryClient.setQueryData(
      ["lastPurchaseIds", subscription.account_id],
      lastPurchaseIds,
    );
  });

  it("can make the cancel request", async () => {
    const wrapper = createWrapper(queryClient);
    const { result, waitForNextUpdate } = renderHook(
      () => useResizeContract(subscription),
      { wrapper },
    );
    result.current.mutate(2);
    await waitForNextUpdate();
    expect(resizeContractSpy).toHaveBeenCalledWith(
      subscription.account_id,
      lastPurchaseIds?.[UserSubscriptionMarketplace.CanonicalUA]?.[
        UserSubscriptionPeriod.Yearly
      ],
      subscription.listing_id,
      2,
      UserSubscriptionPeriod.Yearly,
      UserSubscriptionMarketplace.CanonicalUA,
    );
  });

  it("handles errors", async () => {
    resizeContractSpy.mockImplementation(() =>
      Promise.resolve({
        errors: "Uh oh",
      }),
    );
    const onError = jest.fn();
    const wrapper = createWrapper(queryClient);
    const { result, waitForNextUpdate } = renderHook(
      () => useResizeContract(subscription),
      { wrapper },
    );
    result.current.mutate(2, {
      onError: (error) => onError(error.message),
    });
    await waitForNextUpdate();
    expect(onError).toHaveBeenCalledWith("Uh oh");
  });

  it("invalidates the purchase ids when there is an error", async () => {
    resizeContractSpy.mockImplementation(() =>
      Promise.resolve({
        errors: "Uh oh",
      }),
    );
    const wrapper = createWrapper(queryClient);
    const { result, waitForNextUpdate } = renderHook(
      () => useResizeContract(subscription),
      { wrapper },
    );
    let lastPurchaseIdsState = queryClient.getQueryState([
      "lastPurchaseIds",
      subscription.account_id,
    ]);
    expect(lastPurchaseIdsState?.isInvalidated).toBe(false);
    result.current.mutate(2);
    await waitForNextUpdate();
    lastPurchaseIdsState = queryClient.getQueryState([
      "lastPurchaseIds",
      subscription.account_id,
    ]);
    expect(lastPurchaseIdsState?.isInvalidated).toBe(true);
  });
});
