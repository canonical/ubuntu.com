import React from "react";
import { mount } from "enzyme";
import { QueryClient, QueryClientProvider } from "react-query";

import Notifications from "./Notifications";

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

  it("does not diplay a pending purchase notification when there is no id", () => {
    queryClient.setQueryData("pendingPurchaseId", null);
    const wrapper = mount(
      <QueryClientProvider client={queryClient}>
        <Notifications />
      </QueryClientProvider>
    );
    expect(wrapper.find("[data-test='pendingPurchase']").exists()).toBe(false);
  });
});
