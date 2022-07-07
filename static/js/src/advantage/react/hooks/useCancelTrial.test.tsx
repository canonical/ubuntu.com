import React, { PropsWithChildren } from "react";
import { renderHook, WrapperComponent } from "@testing-library/react-hooks";
import type { ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "react-query";
import { useCancelTrial } from "./useCancelTrail";

import * as contracts from "advantage/api/contracts";
import { UserSubscription } from "advantage/api/types";
import {
  userSubscriptionFactory,
  lastPurchaseIdsFactory,
  userSubscriptionStatusesFactory,
} from "advantage/tests/factories/api";

describe("useCancelTrial", () => {
  let cancelTrialSpy: jest.SpyInstance;
  let queryClient: QueryClient;
  let wrapper: WrapperComponent<ReactNode>;
  let subscription: UserSubscription;

  beforeEach(() => {
    cancelTrialSpy = jest.spyOn(contracts, "endTrial");
    cancelTrialSpy.mockImplementation(() => Promise.resolve({}));

    queryClient = new QueryClient();
    queryClient.setQueryData("userSubscriptions", [subscription]);

    subscription = userSubscriptionFactory.build({
      statuses: userSubscriptionStatusesFactory.build({
        is_trialled: true,
      }),
    });

    const Wrapper = ({ children }: PropsWithChildren<ReactNode>) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
    wrapper = Wrapper;
  });

  it("can make the end trial request", async () => {
    const { result, waitForNextUpdate } = renderHook(
      () => useCancelTrial(subscription?.account_id),
      { wrapper }
    );
    result.current.mutate(null);
    await waitForNextUpdate();
    expect(cancelTrialSpy).toHaveBeenCalledWith(subscription?.account_id);
  });

  it("handles errors", async () => {
    cancelTrialSpy.mockImplementation(() =>
      Promise.resolve({
        errors: "Uh oh",
      })
    );
    const onError = jest.fn();
    const { result, waitForNextUpdate } = renderHook(
      () => useCancelTrial(subscription?.account_id),
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
      () => useCancelTrial(subscription?.account_id),
      { wrapper }
    );

    queryClient.setQueryData(
      ["lastPurchaseIds", subscription.account_id],
      lastPurchaseIdsFactory.build()
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
