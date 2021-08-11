import React from "react";
import { shallow } from "enzyme";

import RenewalSettings from "./RenewalSettings";

describe("RenewalSettings", () => {
  it("renders", () => {
    const wrapper = shallow(
      <RenewalSettings positionNodeRef={{ current: null }} />
    );
    expect(wrapper.find("ContextualMenu").exists()).toBe(true);
  });
});
