import React from "react";
import { shallow } from "enzyme";

import DetailsContent from "./DetailsContent";

describe("DetailsContent", () => {
  it("renders", () => {
    const wrapper = shallow(<DetailsContent />);
    expect(wrapper.find("DetailsTabs").exists()).toBe(true);
  });
});
