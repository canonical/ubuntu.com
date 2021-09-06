import React, { PropsWithChildren } from "react";
import { renderHook, WrapperComponent } from "@testing-library/react-hooks";
import type { ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "react-query";
import {
  selectFreeSubscription,
  selectStatusesSummary,
  useUserSubscriptions,
} from "./useUserSubscriptions";

import {
  freeSubscriptionFactory,
  userSubscriptionFactory,
  userSubscriptionStatusesFactory,
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

  it("can return a summary of subscription statuses", async () => {
    const contracts = [
      userSubscriptionFactory.build({
        statuses: userSubscriptionStatusesFactory.build({
          is_expired: true,
        }),
      }),
      userSubscriptionFactory.build({
        statuses: userSubscriptionStatusesFactory.build({
          is_upsizeable: true,
        }),
      }),
      userSubscriptionFactory.build({
        statuses: userSubscriptionStatusesFactory.build({
          is_cancelled: true,
        }),
      }),
    ];
    queryClient.setQueryData("userSubscriptions", contracts);
    const { result, waitForNextUpdate } = renderHook(
      () => useUserSubscriptions({ select: selectStatusesSummary }),
      { wrapper }
    );
    await waitForNextUpdate();
    expect(result.current.data).toStrictEqual({
      is_cancellable: false,
      is_cancelled: true,
      is_downsizeable: false,
      is_expired: true,
      is_expiring: false,
      is_in_grace_period: false,
      is_renewable: false,
      is_trialled: false,
      is_upsizeable: true,
    });
  });
});
