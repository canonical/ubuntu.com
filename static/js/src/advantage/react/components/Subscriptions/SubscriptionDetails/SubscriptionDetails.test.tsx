import React from "react";
import { shallow } from "enzyme";

import SubscriptionDetails from "./SubscriptionDetails";

describe("SubscriptionDetails", () => {
  it("renders", () => {
    const wrapper = shallow(<SubscriptionDetails />);
    expect(wrapper.find(".p-subscriptions__details").exists()).toBe(true);
  });
});
