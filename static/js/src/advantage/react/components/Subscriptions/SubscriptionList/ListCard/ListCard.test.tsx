import React from "react";
import { mount, shallow } from "enzyme";

import ListCard from "./ListCard";
import { UserSubscription } from "advantage/api/types";
import {
  freeSubscriptionFactory,
  userSubscriptionEntitlementFactory,
  userSubscriptionFactory,
  userSubscriptionStatusesFactory,
} from "advantage/tests/factories/api";
import { EntitlementType, SupportLevel } from "advantage/api/enum";

describe("ListCard", () => {
  let freeSubscription: UserSubscription;

  beforeEach(async () => {
    freeSubscription = freeSubscriptionFactory.build();
  });

  it("can render a free subscription", () => {
    freeSubscription = freeSubscriptionFactory.build({
      entitlements: [
        userSubscriptionEntitlementFactory.build({
          type: EntitlementType.Livepatch,
        }),
        userSubscriptionEntitlementFactory.build({
          support_level: SupportLevel.Advanced,
          type: EntitlementType.Support,
        }),
      ],
      number_of_machines: 2,
      start_date: "2021-07-09T07:14:56Z",
    });
    const wrapper = mount(
      <ListCard subscription={freeSubscription} onClick={jest.fn()} />
    );
    expect(wrapper.find("[data-test='card-title']").text()).toBe(
      "Free Personal Token"
    );
    expect(wrapper.find("[data-test='card-type']").exists()).toBeFalsy();
    expect(wrapper.find("[data-test='card-machines']").text()).toBe("2");
    expect(wrapper.find("[data-test='card-start-date']").text()).toBe(
      "09 Jul 2021"
    );
    expect(wrapper.find("[data-test='card-end-date']").text()).toBe("Never");
  });

  it("can be marked as selected", () => {
    const wrapper = shallow(
      <ListCard
        subscription={freeSubscription}
        isSelected={true}
        onClick={jest.fn()}
      />
    );
    expect(wrapper.find("Card").hasClass("is-active")).toBe(true);
  });

  it("calls the onclick function when the card is clicked", () => {
    const onClick = jest.fn();
    const wrapper = shallow(
      <ListCard subscription={freeSubscription} onClick={onClick} />
    );
    wrapper.find("Card").simulate("click");
    expect(onClick).toHaveBeenCalled();
  });

  it("displays a warning if the subscription has one of the expiry statuses", () => {
    const subscription = userSubscriptionFactory.build({
      statuses: userSubscriptionStatusesFactory.build({
        is_in_grace_period: true,
      }),
    });
    const wrapper = shallow(
      <ListCard subscription={subscription} onClick={jest.fn()} />
    );
    expect(wrapper.find("ExpiryNotification").exists()).toBe(true);
    expect(
      wrapper
        .find("[data-test='subscription-card-content']")
        .hasClass("u-no-padding--top")
    ).toBe(true);
  });

  it("does not display a warning if the subscription is not expiring", () => {
    const subscription = userSubscriptionFactory.build({
      statuses: userSubscriptionStatusesFactory.build({
        is_in_grace_period: false,
        is_expired: false,
        is_expiring: false,
      }),
    });
    const wrapper = shallow(
      <ListCard subscription={subscription} onClick={jest.fn()} />
    );
    expect(wrapper.find("ExpiryNotification").exists()).toBe(false);
    expect(
      wrapper
        .find("[data-test='subscription-card-content']")
        .hasClass("u-no-padding--top")
    ).toBe(false);
  });
});
