import React, { PropsWithChildren } from "react";
import { renderHook, WrapperComponent } from "@testing-library/react-hooks";
import type { ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "react-query";
import { useResizeContract } from "./useResizeContract";

import * as contracts from "advantage/api/contracts";
import {
  lastPurchaseIdsFactory,
  userSubscriptionFactory,
} from "advantage/tests/factories/api";
import { LastPurchaseIds, UserSubscription } from "advantage/api/types";
import { UserSubscriptionPeriod } from "advantage/api/enum";

describe("useResizeContract", () => {
  let resizeContractSpy: jest.SpyInstance;
  let queryClient: QueryClient;
  let wrapper: WrapperComponent<ReactNode>;
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
      () => useResizeContract(subscription),
      { wrapper }
    );
    result.current.mutate(2);
    await waitForNextUpdate();
    expect(resizeContractSpy).toHaveBeenCalledWith(
      subscription.account_id,
      lastPurchaseIds.yearly,
      subscription.listing_id,
      2,
      UserSubscriptionPeriod.Yearly
    );
  });

  it("handles errors", async () => {
    resizeContractSpy.mockImplementation(() =>
      Promise.resolve({
        errors: "Uh oh",
      })
    );
    const onError = jest.fn();
    const { result, waitForNextUpdate } = renderHook(
      () => useResizeContract(subscription),
      { wrapper }
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
      })
    );
    const { result, waitForNextUpdate } = renderHook(
      () => useResizeContract(subscription),
      { wrapper }
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
