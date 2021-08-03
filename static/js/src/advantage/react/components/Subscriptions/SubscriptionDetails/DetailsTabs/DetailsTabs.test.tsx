import React from "react";
import { mount, shallow } from "enzyme";

import DetailsTabs from "./DetailsTabs";

describe("DetailsTabs", () => {
  it("defaults to the features tab", () => {
    const wrapper = shallow(<DetailsTabs />);
    expect(wrapper.find("[data-test='features-content']").exists()).toBe(true);
  });

  it("can change tabs", () => {
    const wrapper = mount(<DetailsTabs />);
    expect(wrapper.find("[data-test='docs-content']").exists()).toBe(false);
    wrapper.find("[data-test='docs-tab']").simulate("click");
    wrapper.update();
    expect(wrapper.find("[data-test='docs-content']").exists()).toBe(true);
  });
});
