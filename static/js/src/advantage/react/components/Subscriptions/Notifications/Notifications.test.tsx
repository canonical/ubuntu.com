import React from "react";
import { mount } from "enzyme";
import { QueryClient, QueryClientProvider } from "react-query";

import Notifications from "./Notifications";
import {
  userSubscriptionFactory,
  userSubscriptionStatusesFactory,
} from "advantage/tests/factories/api";
import { OfferFactory } from "advantage/offers/tests/factories/offers";

describe("Notifications", () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient();
  });

  it("displays a pending purchase notification", () => {
    queryClient.setQueryData("userSubscriptions", [
      userSubscriptionFactory.build({
        statuses: userSubscriptionStatusesFactory.build({
          has_pending_purchases: true,
        }),
      }),
    ]);
    const wrapper = mount(
      <QueryClientProvider client={queryClient}>
        <Notifications />
      </QueryClientProvider>
    );
    expect(wrapper.find("[data-test='pendingPurchase']").exists()).toBe(true);
  });

  it("does not display a pending purchase notification when nothing is pending", () => {
    queryClient.setQueryData("userSubscriptions", [
      userSubscriptionFactory.build({
        statuses: userSubscriptionStatusesFactory.build({
          has_pending_purchases: false,
        }),
      }),
    ]);
    const wrapper = mount(
      <QueryClientProvider client={queryClient}>
        <Notifications />
      </QueryClientProvider>
    );
    expect(wrapper.find("[data-test='pendingPurchase']").exists()).toBe(false);
  });
});

describe("Offers Notifications", () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient();
  });

  it("displays an offer notification if there are offers available", () => {
    queryClient.setQueryData("Offers", [OfferFactory.build()]);
    const wrapper = mount(
      <QueryClientProvider client={queryClient}>
        <Notifications />
      </QueryClientProvider>
    );
    expect(wrapper.find("[data-test='offers']").exists()).toBe(true);
  });

  it("does not display an offer notification if there are no offers available", () => {
    queryClient.setQueryData("Offers", []);
    const wrapper = mount(
      <QueryClientProvider client={queryClient}>
        <Notifications />
      </QueryClientProvider>
    );
    expect(wrapper.find("[data-test='offers']").exists()).toBe(false);
  });
});
