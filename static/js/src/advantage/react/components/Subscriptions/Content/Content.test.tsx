import React from "react";
import { shallow } from "enzyme";

import Content from "./Content";

describe("Content", () => {
  it("renders", () => {
    const wrapper = shallow(<Content />);
    expect(wrapper.find("[data-test='subscription-list']").exists()).toBe(true);
    expect(wrapper.find("[data-test='subscription-details']").exists()).toBe(
      true
    );
  });
});
