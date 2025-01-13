import React from "react";
import { renderHook } from "@testing-library/react-hooks";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useCancelTrial } from "./useCancelTrail";

import * as contracts from "advantage/api/contracts";
import { UserSubscription } from "advantage/api/types";
import {
  userSubscriptionFactory,
  lastPurchaseIdsFactory,
  userSubscriptionStatusesFactory,
} from "advantage/tests/factories/api";

const createWrapper = (queryClient: QueryClient) => {
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe("useCancelTrial", () => {
  let cancelTrialSpy: jest.SpyInstance;
  let queryClient: QueryClient;
  let subscription: UserSubscription;

  beforeEach(() => {
    cancelTrialSpy = jest.spyOn(contracts, "endTrial");
    cancelTrialSpy.mockImplementation(() => Promise.resolve({}));

    queryClient = new QueryClient();
    queryClient.setQueryData(["userSubscriptions"], [subscription]);

    subscription = userSubscriptionFactory.build({
      statuses: userSubscriptionStatusesFactory.build({
        is_trialled: true,
      }),
    });
  });

  it("can make the end trial request", async () => {
    const wrapper = createWrapper(queryClient);
    const { result, waitForNextUpdate } = renderHook(
      () => useCancelTrial(subscription?.account_id),
      { wrapper },
    );
    result.current.mutate(null);
    await waitForNextUpdate();
    expect(cancelTrialSpy).toHaveBeenCalledWith(subscription?.account_id);
  });

  it("handles errors", async () => {
    cancelTrialSpy.mockImplementation(() =>
      Promise.resolve({
        errors: "Uh oh",
      }),
    );
    const onError = jest.fn();
    const wrapper = createWrapper(queryClient);
    const { result, waitForNextUpdate } = renderHook(
      () => useCancelTrial(subscription?.account_id),
      { wrapper },
    );
    result.current.mutate(null, {
      onError: (error) => onError(error.message),
    });
    await waitForNextUpdate();
    expect(onError).toHaveBeenCalledWith("Uh oh");
  });

  it("invalidates queries when successful", async () => {
    const wrapper = createWrapper(queryClient);
    const { result, waitForNextUpdate } = renderHook(
      () => useCancelTrial(subscription?.account_id),
      { wrapper },
    );

    queryClient.setQueryData(
      ["lastPurchaseIds", subscription.account_id],
      lastPurchaseIdsFactory.build(),
    );

    let userSubscriptionsState = queryClient.getQueryState([
      "userSubscriptions",
    ]);
    let lastPurchaseIdsState = queryClient.getQueryState([
      "lastPurchaseIds",
      subscription.account_id,
    ]);
    expect(userSubscriptionsState?.isInvalidated).toBe(false);
    expect(lastPurchaseIdsState?.isInvalidated).toBe(false);
    result.current.mutate(null);
    await waitForNextUpdate();
    userSubscriptionsState = queryClient.getQueryState(["userSubscriptions"]);
    lastPurchaseIdsState = queryClient.getQueryState([
      "lastPurchaseIds",
      subscription.account_id,
    ]);
    expect(userSubscriptionsState?.isInvalidated).toBe(true);
    expect(lastPurchaseIdsState?.isInvalidated).toBe(true);
  });
});
