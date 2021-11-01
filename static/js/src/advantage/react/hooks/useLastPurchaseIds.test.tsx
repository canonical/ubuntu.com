import React, { PropsWithChildren } from "react";
import { renderHook, WrapperComponent } from "@testing-library/react-hooks";
import type { ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "react-query";
import {
  selectPurchaseIdsByMarketplaceAndPeriod,
  useLastPurchaseIds,
} from "./useLastPurchaseIds";

import { lastPurchaseIdsFactory } from "advantage/tests/factories/api";
import {
  UserSubscriptionPeriod,
  UserSubscriptionMarketplace,
} from "advantage/api/enum";

describe("useLastPurchaseIds", () => {
  let queryClient: QueryClient;
  let wrapper: WrapperComponent<ReactNode>;

  beforeEach(() => {
    queryClient = new QueryClient();
    const Wrapper = ({ children }: PropsWithChildren<ReactNode>) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
    wrapper = Wrapper;
  });

  it("can return the last purchase ids from the store", async () => {
    const lastPurchaseIds = lastPurchaseIdsFactory.build();
    queryClient.setQueryData(
      ["lastPurchaseIds", "account123"],
      lastPurchaseIds
    );
    const { result, waitForNextUpdate } = renderHook(
      () => useLastPurchaseIds("account123"),
      { wrapper }
    );
    await waitForNextUpdate();
    expect(result.current.data).toStrictEqual(lastPurchaseIds);
  });

  it("can return last purchase id for a given period and marketplace", async () => {
    const lastPurchaseIds = lastPurchaseIdsFactory.build({
      [UserSubscriptionMarketplace.CanonicalUA]: {
        monthly: "monthly123",
      },
    });
    queryClient.setQueryData(
      ["lastPurchaseIds", "account123"],
      lastPurchaseIds
    );
    const { result, waitForNextUpdate } = renderHook(
      () =>
        useLastPurchaseIds("account123", {
          select: selectPurchaseIdsByMarketplaceAndPeriod(
            UserSubscriptionMarketplace.CanonicalUA,
            UserSubscriptionPeriod.Monthly
          ),
        }),
      { wrapper }
    );
    await waitForNextUpdate();
    expect(result.current.data).toStrictEqual("monthly123");
  });
});
