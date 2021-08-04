import React from "react";
import { shallow } from "enzyme";

import Notifications from "./Notifications";

describe("Notifications", () => {
  it("renders", () => {
    const wrapper = shallow(<Notifications />);
    expect(wrapper.find("Notification").exists()).toBe(true);
  });
});
