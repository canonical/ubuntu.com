import React from "react";
import { shallow } from "enzyme";

import ListGroup from "./ListGroup";

describe("ListGroup", () => {
  it("renders", () => {
    const wrapper = shallow(
      <ListGroup title="free personal token">Group content</ListGroup>
    );
    expect(wrapper.find(".p-subscriptions__list-group").exists()).toBe(true);
  });
});
