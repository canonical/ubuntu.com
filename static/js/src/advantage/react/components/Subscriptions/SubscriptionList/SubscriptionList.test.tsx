import React from "react";
import { mount } from "enzyme";
import { QueryClient, QueryClientProvider } from "react-query";

import SubscriptionList from "./SubscriptionList";
import { freeSubscriptionFactory } from "advantage/tests/factories/api";
import { UserSubscription } from "advantage/api/types";

describe("SubscriptionList", () => {
  let queryClient: QueryClient;
  let freeSubscription: UserSubscription;

  beforeEach(async () => {
    queryClient = new QueryClient();
    freeSubscription = freeSubscriptionFactory.build();
    queryClient.setQueryData("userSubscriptions", [freeSubscription]);
  });

  it("displays a free token", () => {
    const wrapper = mount(
      <QueryClientProvider client={queryClient}>
        <SubscriptionList onSetActive={jest.fn()} />
      </QueryClientProvider>
    );
    const token = wrapper.find("[data-test='free-token']");
    expect(token.exists()).toBe(true);
    expect(token.prop("subscription")).toStrictEqual(freeSubscription);
  });

  it("can display the free token as selected", () => {
    const wrapper = mount(
      <QueryClientProvider client={queryClient}>
        <SubscriptionList selectedToken="free-token" onSetActive={jest.fn()} />
      </QueryClientProvider>
    );
    expect(wrapper.find("[data-test='free-token']").prop("isSelected")).toBe(
      true
    );
  });
});
