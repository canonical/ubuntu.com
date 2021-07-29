import React from "react";
import { shallow } from "enzyme";

import { App } from "./app";

describe("Subscriptions app", () => {
  it("renders", () => {
    const wrapper = shallow(<App />);
    expect(wrapper.find("Subscriptions").exists()).toBe(true);
  });
});
