import React from "react";
import { mount } from "enzyme";
import { Context as ResponsiveContext } from "react-responsive";

import Content from "./Content";

describe("Content", () => {
  it("displays the list and details for large screens", () => {
    const wrapper = mount(
      <ResponsiveContext.Provider value={{ width: 1000 }}>
        <Content />
      </ResponsiveContext.Provider>
    );
    expect(wrapper.find("SubscriptionList").exists()).toBe(true);
    expect(wrapper.find("SubscriptionDetails").exists()).toBe(true);
  });

  it("hides the details for small screens", () => {
    const wrapper = mount(
      <ResponsiveContext.Provider value={{ width: 200 }}>
        <Content />
      </ResponsiveContext.Provider>
    );
    expect(wrapper.find("SubscriptionList").exists()).toBe(true);
    expect(wrapper.find("SubscriptionDetails").exists()).toBe(false);
  });
});
