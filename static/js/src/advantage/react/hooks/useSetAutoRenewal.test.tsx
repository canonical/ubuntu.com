import React, { PropsWithChildren } from "react";
import { renderHook, WrapperComponent } from "@testing-library/react-hooks";
import type { ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "react-query";
import { useSetAutoRenewal } from "./useSetAutoRenewal";

import * as contracts from "advantage/api/contracts";
import { userSubscriptionFactory } from "advantage/tests/factories/api";
import { UserSubscription } from "advantage/api/types";

describe("useSetAutoRenewal", () => {
  let setAutoRenewalSpy: jest.SpyInstance;
  let queryClient: QueryClient;
  let wrapper: WrapperComponent<ReactNode>;
  let userSubscriptions: UserSubscription;

  beforeEach(() => {
    setAutoRenewalSpy = jest.spyOn(contracts, "setAutoRenewal");
    setAutoRenewalSpy.mockImplementation(() => Promise.resolve({}));
    queryClient = new QueryClient();
    userSubscriptions = userSubscriptionFactory.build();
    queryClient.setQueryData("userSubscriptions", userSubscriptions);
    const Wrapper = ({ children }: PropsWithChildren<ReactNode>) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
    wrapper = Wrapper;
  });

  it("can make the request to update the setting", async () => {
    const { result, waitForNextUpdate } = renderHook(
      () => useSetAutoRenewal(),
      { wrapper }
    );
    result.current.mutate({ sub: true });
    await waitForNextUpdate();
    expect(setAutoRenewalSpy).toHaveBeenCalledWith({ sub: true });
  });

  it("handles errors", async () => {
    setAutoRenewalSpy.mockImplementation(() =>
      Promise.resolve({
        errors: "Uh oh",
      })
    );
    const onError = jest.fn();
    const { result, waitForNextUpdate } = renderHook(
      () => useSetAutoRenewal(),
      { wrapper }
    );
    result.current.mutate(
      { sub: true },
      {
        onError: (error) => onError(error.message),
      }
    );
    await waitForNextUpdate();
    expect(onError).toHaveBeenCalledWith("Uh oh");
  });

  it("invalidates queries when successful", async () => {
    const { result, waitForNextUpdate } = renderHook(
      () => useSetAutoRenewal(),
      { wrapper }
    );
    let userSubscriptionsState = queryClient.getQueryState("userSubscriptions");
    expect(userSubscriptionsState?.isInvalidated).toBe(false);
    result.current.mutate({ sub: true });
    await waitForNextUpdate();
    userSubscriptionsState = queryClient.getQueryState("userSubscriptions");
    expect(userSubscriptionsState?.isInvalidated).toBe(true);
  });
});
