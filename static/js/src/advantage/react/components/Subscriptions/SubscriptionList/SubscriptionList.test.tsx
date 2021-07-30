import React from "react";
import { shallow } from "enzyme";

import SubscriptionList from "./SubscriptionList";

describe("SubscriptionList", () => {
  it("renders", () => {
    const wrapper = shallow(<SubscriptionList />);
    expect(wrapper.find(".p-subscribe__list").exists()).toBe(true);
  });
});
