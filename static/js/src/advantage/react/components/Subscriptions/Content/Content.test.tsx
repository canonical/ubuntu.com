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

  it("renders", () => {
    const wrapper = mount(
      <QueryClientProvider client={queryClient}>
        <Content />
      </QueryClientProvider>
    );
    expect(wrapper.find("SubscriptionList").exists()).toBe(true);
    expect(wrapper.find("SubscriptionDetails").exists()).toBe(true);
  });
});
