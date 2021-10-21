import React, { PropsWithChildren } from "react";
import { renderHook, WrapperComponent } from "@testing-library/react-hooks";
import type { ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "react-query";
import {
  selectAutoRenewableUASubscriptions,
  selectFreeSubscription,
  selectStatusesSummary,
  selectSubscriptionById,
  selectUASubscriptions,
  useUserSubscriptions,
} from "./useUserSubscriptions";

import {
  freeSubscriptionFactory,
  userSubscriptionFactory,
  userSubscriptionStatusesFactory,
} from "advantage/tests/factories/api";
import {
  UserSubscriptionMarketplace,
  UserSubscriptionPeriod,
} from "advantage/api/enum";

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
      has_pending_purchases: false,
      is_cancellable: false,
      is_cancelled: true,
      is_downsizeable: false,
      is_expired: true,
      is_expiring: false,
      is_in_grace_period: false,
      is_renewable: false,
      is_renewal_actionable: false,
      is_trialled: false,
      is_upsizeable: true,
    });
  });

  it("can get a subscription by its token", async () => {
    const subscriptions = [
      userSubscriptionFactory.build(),
      userSubscriptionFactory.build({ id: "abc123" }),
      userSubscriptionFactory.build(),
    ];
    queryClient.setQueryData("userSubscriptions", subscriptions);
    const { result, waitForNextUpdate } = renderHook(
      () => useUserSubscriptions({ select: selectSubscriptionById("abc123") }),
      { wrapper }
    );
    await waitForNextUpdate();
    expect(result.current.data).toStrictEqual(subscriptions[1]);
  });

  it("can return ua subscriptions", async () => {
    const subscriptions = [
      userSubscriptionFactory.build({
        marketplace: UserSubscriptionMarketplace.CanonicalUA,
      }),
      userSubscriptionFactory.build({
        marketplace: UserSubscriptionMarketplace.Free,
      }),
      userSubscriptionFactory.build({
        marketplace: UserSubscriptionMarketplace.CanonicalUA,
      }),
    ];
    queryClient.setQueryData("userSubscriptions", subscriptions);
    const { result, waitForNextUpdate } = renderHook(
      () => useUserSubscriptions({ select: selectUASubscriptions }),
      { wrapper }
    );
    await waitForNextUpdate();
    expect(result.current.data).toStrictEqual([
      subscriptions[0],
      subscriptions[2],
    ]);
  });

  it("can return auto renewable UA subscriptions", async () => {
    const subscriptions = [
      // Should not be included because it is in the wrong marketplace:
      userSubscriptionFactory.build({
        marketplace: UserSubscriptionMarketplace.Free,
      }),
      // Should be included:
      userSubscriptionFactory.build({
        marketplace: UserSubscriptionMarketplace.CanonicalUA,
        period: UserSubscriptionPeriod.Monthly,
        statuses: userSubscriptionStatusesFactory.build({
          is_cancelled: false,
          is_expired: false,
        }),
      }),
      // Should not be included because it is not monthly:
      userSubscriptionFactory.build({
        marketplace: UserSubscriptionMarketplace.CanonicalUA,
        period: UserSubscriptionPeriod.Yearly,
      }),
      // Should not be included because it has been cancelled:
      userSubscriptionFactory.build({
        marketplace: UserSubscriptionMarketplace.CanonicalUA,
        period: UserSubscriptionPeriod.Monthly,
        statuses: userSubscriptionStatusesFactory.build({
          is_cancelled: true,
        }),
      }),
      // Should not be included because it has expired:
      userSubscriptionFactory.build({
        marketplace: UserSubscriptionMarketplace.CanonicalUA,
        period: UserSubscriptionPeriod.Monthly,
        statuses: userSubscriptionStatusesFactory.build({
          is_expired: true,
        }),
      }),
    ];
    queryClient.setQueryData("userSubscriptions", subscriptions);
    const { result, waitForNextUpdate } = renderHook(
      () =>
        useUserSubscriptions({ select: selectAutoRenewableUASubscriptions }),
      { wrapper }
    );
    await waitForNextUpdate();
    expect(result.current.data).toStrictEqual([subscriptions[1]]);
  });
});
