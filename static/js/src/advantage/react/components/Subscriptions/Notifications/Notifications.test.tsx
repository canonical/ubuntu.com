import React from "react";
import { mount } from "enzyme";
import { QueryClient, QueryClientProvider } from "react-query";

import Notifications from "./Notifications";
import {
  userSubscriptionFactory,
  userSubscriptionStatusesFactory,
} from "advantage/tests/factories/api";

describe("Notifications", () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient();
  });

  it("displays a pending purchase notification", () => {
    queryClient.setQueryData("pendingPurchaseId", "abc123");
    const wrapper = mount(
      <QueryClientProvider client={queryClient}>
        <Notifications />
      </QueryClientProvider>
    );
    expect(wrapper.find("[data-test='pendingPurchase']").exists()).toBe(true);
  });

  it("does not display a pending purchase notification when there is no id", () => {
    queryClient.setQueryData("pendingPurchaseId", null);
    const wrapper = mount(
      <QueryClientProvider client={queryClient}>
        <Notifications />
      </QueryClientProvider>
    );
    expect(wrapper.find("[data-test='pendingPurchase']").exists()).toBe(false);
  });

  it("can displays an expiring notification", () => {
    queryClient.setQueryData("userSubscriptions", [
      userSubscriptionFactory.build({
        statuses: userSubscriptionStatusesFactory.build({
          is_expiring: true,
        }),
      }),
    ]);
    const wrapper = mount(
      <QueryClientProvider client={queryClient}>
        <Notifications />
      </QueryClientProvider>
    );
    expect(wrapper.find("[data-test='is-expiring']").exists()).toBe(true);
  });

  it("can displays an expired notification", () => {
    queryClient.setQueryData("userSubscriptions", [
      userSubscriptionFactory.build({
        statuses: userSubscriptionStatusesFactory.build({
          is_expired: true,
        }),
      }),
    ]);
    const wrapper = mount(
      <QueryClientProvider client={queryClient}>
        <Notifications />
      </QueryClientProvider>
    );
    expect(wrapper.find("[data-test='is-expired']").exists()).toBe(true);
  });

  it("can displays an grace-period notification", () => {
    queryClient.setQueryData("userSubscriptions", [
      userSubscriptionFactory.build({
        statuses: userSubscriptionStatusesFactory.build({
          is_in_grace_period: true,
        }),
      }),
    ]);
    const wrapper = mount(
      <QueryClientProvider client={queryClient}>
        <Notifications />
      </QueryClientProvider>
    );
    // This displays the same notification as is_expired.
    expect(wrapper.find("[data-test='is-expired']").exists()).toBe(true);
  });
});
