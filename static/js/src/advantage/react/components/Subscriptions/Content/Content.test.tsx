import React from "react";
import { mount } from "enzyme";

import * as contracts from "advantage/api/contracts";
import Content from "./Content";
import { QueryClient, QueryClientProvider } from "react-query";
import { UserSubscription } from "advantage/api/types";
import { userSubscriptionFactory } from "advantage/tests/factories/api";
import { act } from "react-dom/test-utils";

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
});
