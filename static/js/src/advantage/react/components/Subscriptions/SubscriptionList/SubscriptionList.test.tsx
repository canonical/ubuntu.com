import React from "react";
import { mount } from "enzyme";
import { QueryClient, QueryClientProvider } from "react-query";

import SubscriptionList from "./SubscriptionList";
import {
  freeSubscriptionFactory,
  userInfoFactory,
  userSubscriptionFactory,
} from "advantage/tests/factories/api";
import { UserInfo, UserSubscription } from "advantage/api/types";
import ListCard from "./ListCard";
import { UserSubscriptionMarketplace } from "advantage/api/enum";
import ListGroup from "./ListGroup";

describe("SubscriptionList", () => {
  let queryClient: QueryClient;
  let freeSubscription: UserSubscription;
  let userInfo: UserInfo;

  beforeEach(async () => {
    queryClient = new QueryClient();
    freeSubscription = freeSubscriptionFactory.build();
    userInfo = userInfoFactory.build();
    queryClient.setQueryData("userInfo", userInfo);
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

  it("displays a free subscription", () => {
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

  it("shows the renewal settings if there are monthly subs", () => {
    userInfo = userInfoFactory.build({ has_monthly_subscription: true });
    queryClient.setQueryData("userInfo", userInfo);
    const wrapper = mount(
      <QueryClientProvider client={queryClient}>
        <SubscriptionList
          selectedId={freeSubscription.contract_id}
          onSetActive={jest.fn()}
        />
      </QueryClientProvider>
    );
    expect(wrapper.find(ListGroup).first().prop("showRenewalSettings")).toBe(
      true
    );
  });

  it("does not show the renewal settings if there are no monthly subs", () => {
    userInfo = userInfoFactory.build({ has_monthly_subscription: false });
    queryClient.setQueryData("userInfo", userInfo);
    const wrapper = mount(
      <QueryClientProvider client={queryClient}>
        <SubscriptionList
          selectedId={freeSubscription.contract_id}
          onSetActive={jest.fn()}
        />
      </QueryClientProvider>
    );
    expect(wrapper.find(ListGroup).first().prop("showRenewalSettings")).toBe(
      false
    );
  });
});
