import React from "react";
import { mount } from "enzyme";
import { Notification } from "@canonical/react-components";
import { UserSubscriptionType } from "advantage/api/enum";
import { userSubscriptionStatusesFactory } from "advantage/tests/factories/api";
import ExpiryNotification, {
  ExpiryNotificationSize,
} from "./ExpiryNotification";

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
      "Your subscription has expired."
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

  it("is expiring shows default message", () => {
    const statuses = userSubscriptionStatusesFactory.build({
      is_expiring: true,
    });
    const onDismiss = jest.fn();
    const wrapper = mount(
      <ExpiryNotification
        size={ExpiryNotificationSize.Large}
        subscriptionType={UserSubscriptionType.Monthly}
        statuses={statuses}
        onDismiss={onDismiss}
      />
    );
    expect(wrapper.find("[data-test='is_expiring-large']").exists()).toBe(true);
    expect(wrapper.find(Notification).prop("title")).toBe(
      "Your subscription is about to expire."
    );
    expect(wrapper.find(Notification).prop("children")).toBe(
      "Enable auto-renewals via the renewal settings menu to ensure service continuity."
    );
  });

  it("is expiring shows default message for non-defined cases", () => {
    const statuses = userSubscriptionStatusesFactory.build({
      is_expiring: true,
    });
    const onDismiss = jest.fn();
    const wrapper = mount(
      <ExpiryNotification
        size={ExpiryNotificationSize.Large}
        subscriptionType={UserSubscriptionType.Free}
        statuses={statuses}
        onDismiss={onDismiss}
      />
    );
    expect(wrapper.find("[data-test='is_expiring-large']").exists()).toBe(true);
    expect(wrapper.find(Notification).prop("title")).toBe(
      "Your subscription is about to expire."
    );
    expect(wrapper.find(Notification).prop("children")).toBe(
      "Check the subscription errors below for more information."
    );
  });

  it("is expiring shows legacy message", () => {
    const statuses = userSubscriptionStatusesFactory.build({
      is_expiring: true,
      is_renewal_actionable: true,
    });
    const onDismiss = jest.fn();
    const wrapper = mount(
      <ExpiryNotification
        size={ExpiryNotificationSize.Large}
        subscriptionType={UserSubscriptionType.Legacy}
        statuses={statuses}
        onDismiss={onDismiss}
      />
    );
    expect(wrapper.find("[data-test='is_expiring-large']").exists()).toBe(true);
    expect(wrapper.find(Notification).prop("title")).toBe(
      "Your subscription is about to expire."
    );
    expect(wrapper.find(Notification).prop("children")).toBe(
      "Click on Renew subscription to to ensure service continuity."
    );
  });
  it("is expiring shows not legacy message if not actionable", () => {
    const statuses = userSubscriptionStatusesFactory.build({
      is_expiring: true,
      is_renewal_actionable: false,
    });
    const onDismiss = jest.fn();
    const wrapper = mount(
      <ExpiryNotification
        size={ExpiryNotificationSize.Large}
        subscriptionType={UserSubscriptionType.Legacy}
        statuses={statuses}
        onDismiss={onDismiss}
      />
    );
    expect(wrapper.find("[data-test='is_expiring-large']").exists()).toBe(true);
    expect(wrapper.find(Notification).prop("title")).toBe(
      "Your subscription is about to expire."
    );
    expect(wrapper.find(Notification).prop("children")).toBe("");
  });

  it("is in grace period shows legacy message", () => {
    const statuses = userSubscriptionStatusesFactory.build({
      is_in_grace_period: true,
      is_renewal_actionable: true,
    });
    const onDismiss = jest.fn();
    const wrapper = mount(
      <ExpiryNotification
        size={ExpiryNotificationSize.Large}
        subscriptionType={UserSubscriptionType.Legacy}
        statuses={statuses}
        onDismiss={onDismiss}
      />
    );
    expect(
      wrapper.find("[data-test='is_in_grace_period-large']").exists()
    ).toBe(true);
    expect(wrapper.find(Notification).prop("title")).toBe(
      "Your subscription has expired."
    );
    expect(wrapper.find(Notification).prop("children")).toBe(
      "Click on Renew subscription to to ensure service continuity."
    );
  });

  it("is in grace period shows no message if legacy unactionable", () => {
    const statuses = userSubscriptionStatusesFactory.build({
      is_in_grace_period: true,
      is_renewal_actionable: false,
    });
    const onDismiss = jest.fn();
    const wrapper = mount(
      <ExpiryNotification
        size={ExpiryNotificationSize.Large}
        subscriptionType={UserSubscriptionType.Legacy}
        statuses={statuses}
        onDismiss={onDismiss}
      />
    );
    expect(
      wrapper.find("[data-test='is_in_grace_period-large']").exists()
    ).toBe(true);
    expect(wrapper.find(Notification).prop("title")).toBe(
      "Your subscription has expired."
    );
    expect(wrapper.find(Notification).prop("children")).toBe("");
  });

  it("is expired shows legacy message if actionable", () => {
    const statuses = userSubscriptionStatusesFactory.build({
      is_expired: true,
      is_renewal_actionable: true,
    });
    const onDismiss = jest.fn();
    const wrapper = mount(
      <ExpiryNotification
        size={ExpiryNotificationSize.Large}
        subscriptionType={UserSubscriptionType.Legacy}
        statuses={statuses}
        onDismiss={onDismiss}
      />
    );
    expect(wrapper.find("[data-test='is_expired-large']").exists()).toBe(true);
    expect(wrapper.find(Notification).prop("title")).toBe(
      "Your subscription has expired."
    );
    expect(wrapper.find(Notification).prop("children")).toBe(
      "Click on Renew subscription to to ensure service continuity."
    );
  });

  it("is expired shows not legacy message if not actionable", () => {
    const statuses = userSubscriptionStatusesFactory.build({
      is_expired: true,
      is_renewal_actionable: false,
    });
    const onDismiss = jest.fn();
    const wrapper = mount(
      <ExpiryNotification
        size={ExpiryNotificationSize.Large}
        subscriptionType={UserSubscriptionType.Legacy}
        statuses={statuses}
        onDismiss={onDismiss}
      />
    );
    expect(wrapper.find("[data-test='is_expired-large']").exists()).toBe(true);
    expect(wrapper.find(Notification).prop("title")).toBe(
      "Your subscription has expired."
    );
    expect(wrapper.find(Notification).prop("children")).toBe("");
  });

  it("is expiring shows trial message", () => {
    const statuses = userSubscriptionStatusesFactory.build({
      is_expiring: true,
    });
    const onDismiss = jest.fn();
    const wrapper = mount(
      <ExpiryNotification
        size={ExpiryNotificationSize.Large}
        subscriptionType={UserSubscriptionType.Trial}
        statuses={statuses}
        onDismiss={onDismiss}
      />
    );
    expect(wrapper.find("[data-test='is_expiring-large']").exists()).toBe(true);
    expect(wrapper.find(Notification).prop("title")).toBe(
      "Your subscription is about to expire."
    );
    expect(wrapper.find(Notification).prop("children")).toBe(
      "Your trial will end soon."
    );
  });

  it("is in grace period shows trial message", () => {
    const statuses = userSubscriptionStatusesFactory.build({
      is_in_grace_period: true,
    });
    const onDismiss = jest.fn();
    const wrapper = mount(
      <ExpiryNotification
        size={ExpiryNotificationSize.Large}
        subscriptionType={UserSubscriptionType.Trial}
        statuses={statuses}
        onDismiss={onDismiss}
      />
    );
    expect(
      wrapper.find("[data-test='is_in_grace_period-large']").exists()
    ).toBe(true);
    expect(wrapper.find(Notification).prop("title")).toBe(
      "Your subscription has expired."
    );
    expect(wrapper.find(Notification).prop("children")).toBe(
      "Your trial has ended."
    );
  });

  it("is expired period shows trial message", () => {
    const statuses = userSubscriptionStatusesFactory.build({
      is_expired: true,
    });
    const onDismiss = jest.fn();
    const wrapper = mount(
      <ExpiryNotification
        size={ExpiryNotificationSize.Large}
        subscriptionType={UserSubscriptionType.Trial}
        statuses={statuses}
        onDismiss={onDismiss}
      />
    );
    expect(wrapper.find("[data-test='is_expired-large']").exists()).toBe(true);
    expect(wrapper.find(Notification).prop("title")).toBe(
      "Your subscription has expired."
    );
    expect(wrapper.find(Notification).prop("children")).toBe(
      "Your trial has ended."
    );
  });
});
