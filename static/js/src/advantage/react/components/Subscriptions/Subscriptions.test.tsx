import React from "react";
import { shallow } from "enzyme";

import Subscriptions from "./Subscriptions";

describe("Subscriptions", () => {
  it("renders", () => {
    const wrapper = shallow(<Subscriptions />);
    expect(wrapper.find("Content").exists()).toBe(true);
  });
});
