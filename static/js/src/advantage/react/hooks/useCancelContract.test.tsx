import React, { PropsWithChildren } from "react";
import { renderHook, WrapperComponent } from "@testing-library/react-hooks";
import type { ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "react-query";
import { useCancelContract } from "./useCancelContract";

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

describe("useCancelContract", () => {
  let cancelContractSpy: jest.SpyInstance;
  let queryClient: QueryClient;
  let wrapper: WrapperComponent<ReactNode>;
  let subscription: UserSubscription;
  let lastPurchaseIds: LastPurchaseIds;

  beforeEach(() => {
    cancelContractSpy = jest.spyOn(contracts, "cancelContract");
    cancelContractSpy.mockImplementation(() => Promise.resolve({}));
    lastPurchaseIds = lastPurchaseIdsFactory.build();
    subscription = userSubscriptionFactory.build({
      period: UserSubscriptionPeriod.Monthly,
    });
    queryClient = new QueryClient();
    queryClient.setQueryData("userSubscriptions", [subscription]);
    queryClient.setQueryData(
      ["lastPurchaseIds", subscription.account_id],
      lastPurchaseIds
    );
    const Wrapper = ({ children }: PropsWithChildren<ReactNode>) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
    wrapper = Wrapper;
  });

  it("can make the cancel request", async () => {
    const { result, waitForNextUpdate } = renderHook(
      () => useCancelContract(subscription),
      { wrapper }
    );
    result.current.mutate(null);
    await waitForNextUpdate();
    expect(cancelContractSpy).toHaveBeenCalledWith(
      subscription.account_id,
      lastPurchaseIds?.[UserSubscriptionMarketplace.CanonicalUA]?.[
        UserSubscriptionPeriod.Monthly
      ],
      subscription.listing_id,
      subscription.marketplace
    );
  });

  it("handles errors", async () => {
    cancelContractSpy.mockImplementation(() =>
      Promise.resolve({
        errors: "Uh oh",
      })
    );
    const onError = jest.fn();
    const { result, waitForNextUpdate } = renderHook(
      () => useCancelContract(subscription),
      { wrapper }
    );
    result.current.mutate(null, {
      onError: (error) => onError(error.message),
    });
    await waitForNextUpdate();
    expect(onError).toHaveBeenCalledWith("Uh oh");
  });

  it("invalidates queries when successful", async () => {
    const { result, waitForNextUpdate } = renderHook(
      () => useCancelContract(subscription),
      { wrapper }
    );
    let userSubscriptionsState = queryClient.getQueryState("userSubscriptions");
    let lastPurchaseIdsState = queryClient.getQueryState([
      "lastPurchaseIds",
      subscription.account_id,
    ]);
    expect(userSubscriptionsState?.isInvalidated).toBe(false);
    expect(lastPurchaseIdsState?.isInvalidated).toBe(false);
    result.current.mutate(null);
    await waitForNextUpdate();
    userSubscriptionsState = queryClient.getQueryState("userSubscriptions");
    lastPurchaseIdsState = queryClient.getQueryState([
      "lastPurchaseIds",
      subscription.account_id,
    ]);
    expect(userSubscriptionsState?.isInvalidated).toBe(true);
    expect(lastPurchaseIdsState?.isInvalidated).toBe(true);
  });
});
