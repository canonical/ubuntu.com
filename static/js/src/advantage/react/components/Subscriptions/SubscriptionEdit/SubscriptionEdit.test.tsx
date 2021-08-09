import React from "react";
import { mount, shallow } from "enzyme";

import SubscriptionEdit from "./SubscriptionEdit";

describe("SubscriptionEdit", () => {
  it("initially hides the cancel modal", () => {
    const wrapper = shallow(<SubscriptionEdit onClose={jest.fn()} />);
    expect(wrapper.find("SubscriptionCancel").exists()).toBe(false);
  });

  it("can show the cancel modal", async () => {
    const wrapper = mount(<SubscriptionEdit onClose={jest.fn()} />);
    // The portal currently requires a fake event, this should be able to be
    // removed when this issue is resolved:
    // https://github.com/alex-cory/react-useportal/issues/36
    const fakeEvent = { currentTarget: true };
    wrapper
      .find("Button[data-test='cancel-button']")
      .simulate("click", fakeEvent);
    expect(wrapper.find("SubscriptionCancel").exists()).toBe(true);
  });
});
