import React from "react";
import { mount } from "enzyme";
import { QueryClient, QueryClientProvider } from "react-query";

import DetailsContent from "./DetailsContent";
import { freeSubscriptionFactory } from "advantage/tests/factories/api";

describe("DetailsContent", () => {
  it("displays free token specific details", () => {
    const contract = freeSubscriptionFactory.build();
    const queryClient = new QueryClient();
    queryClient.setQueryData("userSubscriptions", [contract]);
    const wrapper = mount(
      <QueryClientProvider client={queryClient}>
        <DetailsContent />
      </QueryClientProvider>
    );
    expect(wrapper.find("[data-test='expires-col']").text()).toBe("Never");
    expect(wrapper.find("[data-test='billing-col']").text()).toBe("None");
    expect(wrapper.find("[data-test='cost-col']").text()).toBe("Free");
  });
});
