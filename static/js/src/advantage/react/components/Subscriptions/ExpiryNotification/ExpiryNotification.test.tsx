import React from "react";
import { mount } from "enzyme";

import ExpiryNotification, {
  ExpiryNotificationSize,
} from "./ExpiryNotification";
import { userSubscriptionStatusesFactory } from "advantage/tests/factories/api";
import { Notification } from "@canonical/react-components";

describe("ExpiryNotification", () => {
  it("can display an expiring notification", () => {
    const statuses = userSubscriptionStatusesFactory.build({
      is_expiring: true,
    });
    const wrapper = mount(
      <ExpiryNotification
        size={ExpiryNotificationSize.Large}
        statuses={statuses}
      />
    );
    expect(wrapper.find("[data-test='is_expiring-large']").exists()).toBe(true);
    expect(wrapper.find(Notification).prop("borderless")).toBe(false);
    expect(wrapper.find(Notification).prop("title")).toBe(
      "Your subscription is about to expire."
    );
  });

  it("can display a large expired notification", () => {
    const statuses = userSubscriptionStatusesFactory.build({
      is_expired: true,
    });
    const wrapper = mount(
      <ExpiryNotification
        size={ExpiryNotificationSize.Large}
        statuses={statuses}
      />
    );
    expect(wrapper.find("[data-test='is_expired-large']").exists()).toBe(true);
    expect(wrapper.find(Notification).prop("borderless")).toBe(false);
    expect(wrapper.find(Notification).prop("title")).toBe(
      "This subscription has expired."
    );
  });

  it("can display a large grace-period notification", () => {
    const statuses = userSubscriptionStatusesFactory.build({
      is_in_grace_period: true,
    });
    const wrapper = mount(
      <ExpiryNotification
        size={ExpiryNotificationSize.Large}
        statuses={statuses}
      />
    );
    expect(
      wrapper.find("[data-test='is_in_grace_period-large']").exists()
    ).toBe(true);
    expect(wrapper.find(Notification).prop("borderless")).toBe(false);
    expect(wrapper.find(Notification).prop("title")).toBe(
      "Your subscription has expired."
    );
  });

  it("can display multiple notifications", () => {
    const statuses = userSubscriptionStatusesFactory.build({
      is_in_grace_period: true,
      is_expired: true,
      is_expiring: false,
    });
    const wrapper = mount(
      <ExpiryNotification
        showMultiple
        size={ExpiryNotificationSize.Large}
        statuses={statuses}
      />
    );
    expect(
      wrapper.find("[data-test='is_in_grace_period-large']").exists()
    ).toBe(true);
    expect(wrapper.find("[data-test='is_expired-large']").exists()).toBe(true);
    expect(wrapper.find("[data-test='is_expiring-large']").exists()).toBe(
      false
    );
  });

  it("shows the highest priority notification when only showing one", () => {
    const statuses = userSubscriptionStatusesFactory.build({
      is_in_grace_period: true,
      is_expired: true,
      is_expiring: true,
    });
    const wrapper = mount(
      <ExpiryNotification
        size={ExpiryNotificationSize.Large}
        statuses={statuses}
      />
    );
    expect(wrapper.find("[data-test='is_expired-large']").exists()).toBe(true);
    expect(
      wrapper.find("[data-test='is_in_grace_period-large']").exists()
    ).toBe(false);
    expect(wrapper.find("[data-test='is_expiring-large']").exists()).toBe(
      false
    );
  });

  it("can show a small notification", () => {
    const statuses = userSubscriptionStatusesFactory.build({
      is_expired: true,
    });
    const wrapper = mount(
      <ExpiryNotification
        size={ExpiryNotificationSize.Small}
        statuses={statuses}
      />
    );
    expect(wrapper.find("[data-test='is_expired-small']").exists()).toBe(true);
    expect(wrapper.find(Notification).prop("title")).toBeNull();
    expect(wrapper.find(Notification).prop("borderless")).toBe(true);
  });

  it("can pass additional props to the notification", () => {
    const statuses = userSubscriptionStatusesFactory.build({
      is_expired: true,
    });
    const onDismiss = jest.fn();
    const wrapper = mount(
      <ExpiryNotification
        size={ExpiryNotificationSize.Small}
        statuses={statuses}
        onDismiss={onDismiss}
      />
    );
    expect(wrapper.find(Notification).prop("onDismiss")).toBe(onDismiss);
  });
});
