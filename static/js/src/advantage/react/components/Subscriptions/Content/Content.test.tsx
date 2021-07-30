import React from "react";
import { shallow } from "enzyme";

import Content from "./Content";

describe("Content", () => {
  it("renders", () => {
    const wrapper = shallow(<Content />);
    expect(wrapper.find("SubscriptionList").exists()).toBe(true);
    expect(wrapper.find("SubscriptionDetails").exists()).toBe(true);
  });
});
