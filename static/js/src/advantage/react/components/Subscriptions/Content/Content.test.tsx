import React from "react";
import { act } from "react-dom/test-utils";
import { QueryClient, QueryClientProvider } from "react-query";
import { mount } from "enzyme";
import * as contracts from "advantage/api/contracts";
import { UserSubscriptionMarketplace } from "advantage/api/enum";
import { UserSubscription } from "advantage/api/types";
import { userSubscriptionFactory } from "advantage/tests/factories/api";
import SubscriptionList from "../SubscriptionList";
import Content from "./Content";

describe("Content", () => {
  let queryClient: QueryClient;
  let contract: UserSubscription;
  let getUserSubscriptionsSpy: jest.SpyInstance;

  beforeEach(async () => {
    getUserSubscriptionsSpy = jest.spyOn(contracts, "getUserSubscriptions");
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
      },
    });
    contract = userSubscriptionFactory.build();
    queryClient.setQueryData("userSubscriptions", [contract]);
  });
  afterAll(() => {
    jest.restoreAllMocks();
  });

  it("displays a spinner when loading", () => {
    // Remove the queries so that the query starts loading.
    queryClient.removeQueries("userSubscriptions");
    const wrapper = mount(
      <QueryClientProvider client={queryClient}>
        <Content />
      </QueryClientProvider>
    );
    expect(wrapper.find("[data-test='initial-load'] Spinner").exists()).toBe(
      true
    );
    expect(wrapper.find("SubscriptionList").exists()).toBe(false);
    expect(wrapper.find("SubscriptionDetails").exists()).toBe(false);
  });

  it("displays the list and details when loaded", () => {
    const wrapper = mount(
      <QueryClientProvider client={queryClient}>
        <Content />
      </QueryClientProvider>
    );
    expect(wrapper.find("[data-test='initial-load']").exists()).toBe(false);
    expect(wrapper.find("SubscriptionList").exists()).toBe(true);
    expect(wrapper.find("SubscriptionDetails").exists()).toBe(true);
  });

  it("displays a message if the contracts can't be loaded", async () => {
    // Mock the hook to simulate a failed request.
    getUserSubscriptionsSpy.mockImplementation(() => Promise.reject("Uh oh"));
    // Remove the current queries so that the hook attempts to refetch the subs.
    queryClient.removeQueries("userSubscriptions");
    const wrapper = mount(
      <QueryClientProvider client={queryClient}>
        <Content />
      </QueryClientProvider>
    );
    // Use act and wrapper.update to force waiting  for the component to finish rendering.
    await act(async () => {});
    wrapper.update();
    expect(
      wrapper.find("Notification[data-test='loading-error']").exists()
    ).toBe(true);
    expect(wrapper.find("SubscriptionList").exists()).toBe(false);
    expect(wrapper.find("SubscriptionDetails").exists()).toBe(false);
  });

  it("selects the first UA subscription", () => {
    const subscriptions = [
      userSubscriptionFactory.build({
        marketplace: UserSubscriptionMarketplace.CanonicalUA,
        start_date: new Date("2020-08-11T02:56:54Z"),
      }),
      userSubscriptionFactory.build({
        marketplace: UserSubscriptionMarketplace.Free,
        start_date: new Date("2021-09-11T02:56:54Z"),
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
        <Content />
      </QueryClientProvider>
    );
    expect(wrapper.find(SubscriptionList).prop("selectedId")).toBe(
      subscriptions[2].id
    );
  });

  it("selects the first non-UA sub if there are no UA subs", () => {
    const subscriptions = [
      userSubscriptionFactory.build({
        marketplace: UserSubscriptionMarketplace.Free,
        start_date: new Date("2020-08-11T02:56:54Z"),
      }),
      userSubscriptionFactory.build({
        marketplace: UserSubscriptionMarketplace.Free,
        start_date: new Date("2021-09-11T02:56:54Z"),
      }),
      userSubscriptionFactory.build({
        marketplace: UserSubscriptionMarketplace.Free,
        start_date: new Date("2021-08-11T02:56:54Z"),
      }),
    ];
    queryClient.setQueryData("userSubscriptions", subscriptions);
    const wrapper = mount(
      <QueryClientProvider client={queryClient}>
        <Content />
      </QueryClientProvider>
    );
    expect(wrapper.find(SubscriptionList).prop("selectedId")).toBe(
      subscriptions[1].id
    );
  });

  it("redirects user to checkout if repurchase parameter is set", () => {
    global.window = Object.create(window);
    const hash =
      "#repurchase,aAaBbCcDd,lAaBbCcDdEe,12,yearly,canonical-ua,90000,Ubuntu%20Pro";

    Object.defineProperty(window, "location", {
      value: {
        hash: hash,
        href: "/old/url",
      },
    });

    mount(
      <QueryClientProvider client={queryClient}>
        <Content />
      </QueryClientProvider>
    );

    expect(window.accountId).toBe("aAaBbCcDd");
    expect(localStorage.getItem("shop-checkout-data")).toBe(
      '{"product":{"canBeTrialled":false,"longId":"lAaBbCcDdEe","name":"Ubuntu Pro","period":"yearly","price":{"value":7500},"id":"physical-uai-essential-weekday-yearly","marketplace":"canonical-ua"},"quantity":12,"action":"purchase"}'
    );
    expect(window.location.href).toBe("/account/checkout");
  });
});
