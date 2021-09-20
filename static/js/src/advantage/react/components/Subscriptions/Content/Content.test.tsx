import React from "react";
import { mount } from "enzyme";

import Content from "./Content";
import { QueryClient, QueryClientProvider } from "react-query";
import { UserSubscription } from "advantage/api/types";
import { userSubscriptionFactory } from "advantage/tests/factories/api";

describe("Content", () => {
  let queryClient: QueryClient;
  let contract: UserSubscription;

  beforeEach(async () => {
    queryClient = new QueryClient();
    contract = userSubscriptionFactory.build();
    queryClient.setQueryData("userSubscriptions", [contract]);
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
});
