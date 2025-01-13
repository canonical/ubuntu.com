import React from "react";
import { renderHook } from "@testing-library/react-hooks";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useSetAutoRenewal } from "./useSetAutoRenewal";

import * as contracts from "advantage/api/contracts";
import { userSubscriptionFactory } from "advantage/tests/factories/api";
import { UserSubscription } from "advantage/api/types";

const createWrapper = (queryClient: QueryClient) => {
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe("useSetAutoRenewal", () => {
  let setAutoRenewalSpy: jest.SpyInstance;
  let queryClient: QueryClient;
  let userSubscriptions: UserSubscription;

  beforeEach(() => {
    setAutoRenewalSpy = jest.spyOn(contracts, "setAutoRenewal");
    setAutoRenewalSpy.mockImplementation(() => Promise.resolve({}));
    queryClient = new QueryClient();
    userSubscriptions = userSubscriptionFactory.build();
    queryClient.setQueryData(["userSubscriptions"], userSubscriptions);
  });

  it("can make the request to update the setting", async () => {
    const wrapper = createWrapper(queryClient);
    const { result, waitForNextUpdate } = renderHook(
      () => useSetAutoRenewal(),
      { wrapper },
    );
    result.current.mutate({ sub: true });
    await waitForNextUpdate();
    expect(setAutoRenewalSpy).toHaveBeenCalledWith({ sub: true });
  });

  it("handles errors", async () => {
    setAutoRenewalSpy.mockImplementation(() =>
      Promise.resolve({
        errors: "Uh oh",
      }),
    );
    const onError = jest.fn();
    const wrapper = createWrapper(queryClient);
    const { result, waitForNextUpdate } = renderHook(
      () => useSetAutoRenewal(),
      { wrapper },
    );
    result.current.mutate(
      { sub: true },
      {
        onError: (error) => onError(error.message),
      },
    );
    await waitForNextUpdate();
    expect(onError).toHaveBeenCalledWith("Uh oh");
  });

  it("invalidates queries when successful", async () => {
    const wrapper = createWrapper(queryClient);
    const { result, waitForNextUpdate } = renderHook(
      () => useSetAutoRenewal(),
      { wrapper },
    );
    let userSubscriptionsState = queryClient.getQueryState([
      "userSubscriptions",
    ]);
    expect(userSubscriptionsState?.isInvalidated).toBe(false);
    result.current.mutate({ sub: true });
    await waitForNextUpdate();
    userSubscriptionsState = queryClient.getQueryState(["userSubscriptions"]);
    expect(userSubscriptionsState?.isInvalidated).toBe(true);
  });
});
