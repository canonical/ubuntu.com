import React from "react";
import { mount } from "enzyme";
import { QueryClient, QueryClientProvider } from "react-query";

import SubscriptionList from "./SubscriptionList";
import {
  freeSubscriptionFactory,
  userSubscriptionFactory,
  userSubscriptionStatusesFactory,
} from "advantage/tests/factories/api";
import { UserSubscription } from "advantage/api/types";
import ListCard from "./ListCard";
import {
  UserSubscriptionMarketplace,
  UserSubscriptionPeriod,
} from "advantage/api/enum";

describe("SubscriptionList", () => {
  let queryClient: QueryClient;
  let freeSubscription: UserSubscription;

  beforeEach(async () => {
    queryClient = new QueryClient();
    freeSubscription = freeSubscriptionFactory.build();
    queryClient.setQueryData("userSubscriptions", [freeSubscription]);
  });

  it("can display UA subscriptions", () => {
    const subscriptions = [
      userSubscriptionFactory.build({
        marketplace: UserSubscriptionMarketplace.CanonicalUA,
      }),
      userSubscriptionFactory.build({
        marketplace: UserSubscriptionMarketplace.CanonicalUA,
      }),
    ];
    queryClient.setQueryData("userSubscriptions", subscriptions);
    const wrapper = mount(
      <QueryClientProvider client={queryClient}>
        <SubscriptionList onSetActive={jest.fn()} />
      </QueryClientProvider>
    );
    expect(wrapper.find("[data-test='ua-subscription']").length).toBe(2);
    expect(wrapper.find(ListCard).at(0).prop("subscription")).toStrictEqual(
      subscriptions[0]
    );
    expect(wrapper.find(ListCard).at(1).prop("subscription")).toStrictEqual(
      subscriptions[1]
    );
  });

  it("does not display the UA subscriptions group if there are none", () => {
    const subscriptions = [
      userSubscriptionFactory.build({
        marketplace: UserSubscriptionMarketplace.Free,
      }),
    ];
    queryClient.setQueryData("userSubscriptions", subscriptions);
    const wrapper = mount(
      <QueryClientProvider client={queryClient}>
        <SubscriptionList onSetActive={jest.fn()} />
      </QueryClientProvider>
    );
    expect(
      wrapper.find("ListGroup[data-test='ua-subscriptions-group']").exists()
    ).toBe(false);
  });

  it("sorts the UA subscriptions by most recently started", () => {
    const subscriptions = [
      userSubscriptionFactory.build({
        marketplace: UserSubscriptionMarketplace.CanonicalUA,
        start_date: new Date("2020-08-11T02:56:54Z"),
      }),
      userSubscriptionFactory.build({
        marketplace: UserSubscriptionMarketplace.CanonicalUA,
        start_date: new Date("2021-08-11T02:56:54Z"),
      }),
      userSubscriptionFactory.build({
        marketplace: UserSubscriptionMarketplace.CanonicalUA,
        start_date: new Date("1999-08-11T02:56:54Z"),
      }),
    ];
    queryClient.setQueryData("userSubscriptions", subscriptions);
    const wrapper = mount(
      <QueryClientProvider client={queryClient}>
        <SubscriptionList onSetActive={jest.fn()} />
      </QueryClientProvider>
    );
    expect(wrapper.find(ListCard).at(0).prop("subscription")).toStrictEqual(
      subscriptions[1]
    );
    expect(wrapper.find(ListCard).at(1).prop("subscription")).toStrictEqual(
      subscriptions[0]
    );
    expect(wrapper.find(ListCard).at(2).prop("subscription")).toStrictEqual(
      subscriptions[2]
    );
  });

  it("displays a free subscription when no subscriptions exist", () => {
    const wrapper = mount(
      <QueryClientProvider client={queryClient}>
        <SubscriptionList onSetActive={jest.fn()} />
      </QueryClientProvider>
    );
    const token = wrapper.find("[data-test='free-subscription']");
    expect(token.exists()).toBe(true);
    expect(token.prop("subscription")).toStrictEqual(freeSubscription);
  });

  it("can display the free token as selected", () => {
    const wrapper = mount(
      <QueryClientProvider client={queryClient}>
        <SubscriptionList
          selectedId={freeSubscription.id}
          onSetActive={jest.fn()}
        />
      </QueryClientProvider>
    );
    expect(
      wrapper.find("[data-test='free-subscription']").prop("isSelected")
    ).toBe(true);
  });

  it("hide free subscription if an active paid subscription exists", () => {
    const subscriptions = [
      userSubscriptionFactory.build({
        statuses: userSubscriptionStatusesFactory.build({
          is_subscription_active: true,
        }),
      }),
      userSubscriptionFactory.build({
        statuses: userSubscriptionStatusesFactory.build({
          is_expired: true,
          is_subscription_active: false,
        }),
      }),
      freeSubscription,
    ];
    queryClient.setQueryData("userSubscriptions", subscriptions);
    const wrapper = mount(
      <QueryClientProvider client={queryClient}>
        <SubscriptionList onSetActive={jest.fn()} />
      </QueryClientProvider>
    );
    const token = wrapper.find("[data-test='free-subscription']");
    expect(token.exists()).toBe(false);
  });

  it("display free subscription if there is no active paid subscription", () => {
    queryClient.setQueryData("userSubscriptions", [
      userSubscriptionFactory.build({
        statuses: userSubscriptionStatusesFactory.build({
          is_cancelled: true,
          is_subscription_active: false,
        }),
      }),
      userSubscriptionFactory.build({
        statuses: userSubscriptionStatusesFactory.build({
          is_expired: true,
          is_subscription_active: false,
        }),
      }),
      freeSubscription,
    ]);
    const wrapper = mount(
      <QueryClientProvider client={queryClient}>
        <SubscriptionList onSetActive={jest.fn()} />
      </QueryClientProvider>
    );
    const token = wrapper.find("[data-test='free-subscription']");
    expect(token.exists()).toBe(true);
    expect(token.prop("subscription")).toStrictEqual(freeSubscription);
  });

  it("shows the renewal settings if there subscriptions for which we should present the auto-renewal option", () => {
    queryClient.setQueryData("userSubscriptions", [
      userSubscriptionFactory.build({
        period: UserSubscriptionPeriod.Yearly,
        subscription_id: "abc",
        statuses: userSubscriptionStatusesFactory.build({
          is_subscription_active: false,
          is_subscription_auto_renewing: true,
          should_present_auto_renewal: false,
        }),
      }),
      userSubscriptionFactory.build({
        period: UserSubscriptionPeriod.Monthly,
        subscription_id: "ghi",
        statuses: userSubscriptionStatusesFactory.build({
          is_subscription_active: true,
          is_subscription_auto_renewing: true,
          should_present_auto_renewal: true,
        }),
      }),
    ]);
    const wrapper = mount(
      <QueryClientProvider client={queryClient}>
        <SubscriptionList
          selectedId={freeSubscription.contract_id}
          onSetActive={jest.fn()}
        />
      </QueryClientProvider>
    );
    expect(wrapper.find("RenewalSettings").exists()).toBe(true);
  });

  it("does not show the renewal settings if there are no subscriptions for which we should present the auto-renewal option", () => {
    queryClient.setQueryData("userSubscriptions", [
      userSubscriptionFactory.build({
        period: UserSubscriptionPeriod.Monthly,
        subscription_id: "abc",
        statuses: userSubscriptionStatusesFactory.build({
          is_subscription_active: false,
          is_subscription_auto_renewing: true,
          should_present_auto_renewal: false,
        }),
      }),
      userSubscriptionFactory.build({
        period: UserSubscriptionPeriod.Yearly,
        subscription_id: "ghi",
        statuses: userSubscriptionStatusesFactory.build({
          is_subscription_active: true,
          is_subscription_auto_renewing: false,
          should_present_auto_renewal: false,
        }),
      }),
    ]);
    const wrapper = mount(
      <QueryClientProvider client={queryClient}>
        <SubscriptionList
          selectedId={freeSubscription.contract_id}
          onSetActive={jest.fn()}
        />
      </QueryClientProvider>
    );
    expect(wrapper.find("RenewalSettings").exists()).toBe(false);
  });
});
