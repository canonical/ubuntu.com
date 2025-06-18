import React from "react";
import { renderHook } from "@testing-library/react-hooks";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  selectAutoRenewableSubscriptionsByMarketplace,
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

const createWrapper = (queryClient: QueryClient) => {
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe("useUserSubscriptions", () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient();
  });

  it("can return the user subscriptions from the store", async () => {
    const contracts = [
      userSubscriptionFactory.build(),
      freeSubscriptionFactory.build(),
    ];
    const wrapper = createWrapper(queryClient);
    queryClient.setQueryData(["userSubscriptions"], contracts);
    const { result, waitForNextUpdate } = renderHook(
      () => useUserSubscriptions(),
      { wrapper },
    );
    await waitForNextUpdate();
    expect(result.current.data).toStrictEqual(contracts);
  });

  it("can return the free account", async () => {
    const freeContract = freeSubscriptionFactory.build();
    const contracts = [userSubscriptionFactory.build(), freeContract];
    queryClient.setQueryData(["userSubscriptions"], contracts);
    const wrapper = createWrapper(queryClient);
    const { result, waitForNextUpdate } = renderHook(
      () => useUserSubscriptions({ select: selectFreeSubscription }),
      { wrapper },
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
    queryClient.setQueryData(["userSubscriptions"], contracts);
    const wrapper = createWrapper(queryClient);
    const { result, waitForNextUpdate } = renderHook(
      () => useUserSubscriptions({ select: selectStatusesSummary }),
      { wrapper },
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
      is_subscription_active: false,
      is_subscription_auto_renewing: false,
      should_present_auto_renewal: false,
      has_access_to_support: true,
      has_access_to_token: true,
      is_renewed: true,
    });
  });

  it("can get a subscription by its token", async () => {
    const subscriptions = [
      userSubscriptionFactory.build(),
      userSubscriptionFactory.build({ id: "abc123" }),
      userSubscriptionFactory.build(),
    ];
    queryClient.setQueryData(["userSubscriptions"], subscriptions);
    const wrapper = createWrapper(queryClient);
    const { result, waitForNextUpdate } = renderHook(
      () => useUserSubscriptions({ select: selectSubscriptionById("abc123") }),
      { wrapper },
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
    queryClient.setQueryData(["userSubscriptions"], subscriptions);
    const wrapper = createWrapper(queryClient);
    const { result, waitForNextUpdate } = renderHook(
      () => useUserSubscriptions({ select: selectUASubscriptions }),
      { wrapper },
    );
    await waitForNextUpdate();
    expect(result.current.data).toStrictEqual([
      subscriptions[0],
      subscriptions[2],
    ]);
  });

  it("can return auto renewable UA subscriptions", async () => {
    const subscriptions = [
      userSubscriptionFactory.build({
        marketplace: UserSubscriptionMarketplace.CanonicalUA,
        period: UserSubscriptionPeriod.Monthly,
        statuses: userSubscriptionStatusesFactory.build({
          should_present_auto_renewal: true,
        }),
      }),
      userSubscriptionFactory.build({
        marketplace: UserSubscriptionMarketplace.CanonicalUA,
        period: UserSubscriptionPeriod.Monthly,
        statuses: userSubscriptionStatusesFactory.build({
          should_present_auto_renewal: false,
        }),
      }),
    ];
    queryClient.setQueryData(["userSubscriptions"], subscriptions);
    const wrapper = createWrapper(queryClient);
    const { result, waitForNextUpdate } = renderHook(
      () =>
        useUserSubscriptions({
          select: selectAutoRenewableSubscriptionsByMarketplace(
            UserSubscriptionMarketplace.CanonicalUA,
          ),
        }),
      { wrapper },
    );
    await waitForNextUpdate();
    expect(result.current.data).toStrictEqual([subscriptions[0]]);
  });
});
