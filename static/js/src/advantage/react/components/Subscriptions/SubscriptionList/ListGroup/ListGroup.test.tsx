import React from "react";
import { shallow } from "enzyme";

import ListGroup from "./ListGroup";

describe("ListGroup", () => {
  it("does not display the renewal settings by default", () => {
    const wrapper = shallow(
      <ListGroup title="free personal token">Group content</ListGroup>
    );
    expect(wrapper.find("RenewalSettings").exists()).toBe(false);
  });

  it("can display the renewal settings", () => {
    const wrapper = shallow(
      <ListGroup title="free personal token" showRenewalSettings>
        Group content
      </ListGroup>
    );
    expect(wrapper.find("RenewalSettings").exists()).toBe(true);
  });
});
