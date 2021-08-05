import { Modal } from "@canonical/react-components";
import React from "react";
import { shallow } from "enzyme";

import SubscriptionCancel from "./SubscriptionCancel";

describe("SubscriptionCancel", () => {
  it("handles closing the modal", () => {
    const onClose = jest.fn();
    const wrapper = shallow(<SubscriptionCancel onClose={onClose} />);
    wrapper.find(Modal).invoke("close")!();
    expect(onClose).toHaveBeenCalled();
  });
});
