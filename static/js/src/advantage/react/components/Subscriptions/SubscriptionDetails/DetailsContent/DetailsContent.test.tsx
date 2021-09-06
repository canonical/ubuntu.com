import React from "react";
import { mount } from "enzyme";
import { QueryClient, QueryClientProvider } from "react-query";

import DetailsContent from "./DetailsContent";
import {
  freeSubscriptionFactory,
  userSubscriptionFactory,
} from "advantage/tests/factories/api";
import { UserSubscriptionPeriod } from "advantage/api/enum";

describe("DetailsContent", () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient();
  });

  it("displays free token specific details", () => {
    const contract = freeSubscriptionFactory.build();
    queryClient.setQueryData("userSubscriptions", [contract]);
    const wrapper = mount(
      <QueryClientProvider client={queryClient}>
        <DetailsContent selectedToken="0" />
      </QueryClientProvider>
    );
    expect(wrapper.find("[data-test='expires-col']").text()).toBe("Never");
    expect(wrapper.find("[data-test='billing-col']").text()).toBe("None");
    expect(wrapper.find("[data-test='cost-col']").text()).toBe("Free");
  });

  it("displays ua subscription specific details", () => {
    const contract = userSubscriptionFactory.build({
      end_date: new Date("2022-07-09T07:21:21Z"),
      number_of_machines: 2,
      period: UserSubscriptionPeriod.Yearly,
      price_per_unit: 150000,
    });
    queryClient.setQueryData("userSubscriptions", [contract]);
    const wrapper = mount(
      <QueryClientProvider client={queryClient}>
        <DetailsContent selectedToken="0" />
      </QueryClientProvider>
    );
    expect(wrapper.find("[data-test='expires-col']").text()).toBe("09.07.2022");
    expect(wrapper.find("[data-test='billing-col']").text()).toBe("Yearly");
    expect(wrapper.find("[data-test='cost-col']").text()).toBe(
      "$300,000 USD/yr"
    );
  });
});
