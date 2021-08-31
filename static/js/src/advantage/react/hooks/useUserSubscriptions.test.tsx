import React, { PropsWithChildren } from "react";
import { renderHook, WrapperComponent } from "@testing-library/react-hooks";
import type { ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "react-query";
import {
  selectFreeSubscription,
  useUserSubscriptions,
} from "./useUserSubscriptions";

import {
  freeSubscriptionFactory,
  userSubscriptionFactory,
} from "advantage/tests/factories/api";

describe("useUserSubscriptions", () => {
  let queryClient: QueryClient;
  let wrapper: WrapperComponent<ReactNode>;

  beforeEach(() => {
    queryClient = new QueryClient();
    const Wrapper = ({ children }: PropsWithChildren<ReactNode>) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
    wrapper = Wrapper;
  });

  it("can return the user subscriptions from the store", async () => {
    const contracts = [
      userSubscriptionFactory.build(),
      freeSubscriptionFactory.build(),
    ];
    queryClient.setQueryData("userSubscriptions", contracts);
    const { result, waitForNextUpdate } = renderHook(
      () => useUserSubscriptions(),
      { wrapper }
    );
    await waitForNextUpdate();
    expect(result.current.data).toStrictEqual(contracts);
  });

  it("can return the free account", async () => {
    const freeContract = freeSubscriptionFactory.build();
    const contracts = [userSubscriptionFactory.build(), freeContract];
    queryClient.setQueryData("userSubscriptions", contracts);
    const { result, waitForNextUpdate } = renderHook(
      () => useUserSubscriptions({ select: selectFreeSubscription }),
      { wrapper }
    );
    await waitForNextUpdate();
    expect(result.current.data).toStrictEqual(freeContract);
  });
});
