import React from "react";
import { mount } from "enzyme";
import fetch from "jest-fetch-mock";

import { RenewalSettings } from "./RenewalSettings";
import { UserSubscription } from "advantage/api/types";
import { QueryClient, QueryClientProvider } from "react-query";
import {
  userSubscriptionFactory,
  userSubscriptionStatusesFactory,
} from "advantage/tests/factories/api";
import {
  UserSubscriptionMarketplace,
  UserSubscriptionPeriod,
} from "advantage/api/enum";
import * as contracts from "advantage/api/contracts";
import { act } from "react-dom/test-utils";
import { Notification } from "@canonical/react-components";

describe("RenewalSettings", () => {
  let queryClient: QueryClient;
  let sub: UserSubscription;
  const subscriptionID = "abc";
  let getUserSubscriptionsSpy: jest.SpyInstance;
  let setAutoRenewalSpy: jest.SpyInstance;

  beforeEach(async () => {
    fetch.mockResponse(JSON.stringify(""));
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          // Disable calling the fetch requests.
          enabled: false,
          // Don't retry fetching the queries so it fails in the test.
          retry: false,
        },
      },
    });
    sub = userSubscriptionFactory.build({
      period: UserSubscriptionPeriod.Monthly,
    });
    queryClient.setQueryData("userSubscriptions", [sub]);
    getUserSubscriptionsSpy = jest.spyOn(contracts, "getUserSubscriptions");
    setAutoRenewalSpy = jest.spyOn(contracts, "setAutoRenewal");
    setAutoRenewalSpy.mockImplementation(() => Promise.resolve({}));
  });

  afterAll(() => {
    jest.restoreAllMocks();
  });

  it("displays a single subscription correctly", () => {
    queryClient.setQueryData("userSubscriptions", [
      userSubscriptionFactory.build({
        period: UserSubscriptionPeriod.Monthly,
        subscription_id: subscriptionID,
        statuses: userSubscriptionStatusesFactory.build({
          is_subscription_auto_renewing: true,
          should_present_auto_renewal: true,
        }),
      }),
    ]);
    const wrapper = mount(
      <QueryClientProvider client={queryClient}>
        <RenewalSettings
          positionNodeRef={{ current: null }}
          marketplace={UserSubscriptionMarketplace.CanonicalUA}
        />
      </QueryClientProvider>
    );
    // Open the menu so that the content gets rendered inside the portal.
    wrapper.find("Button.p-contextual-menu__toggle").simulate("click");
    expect(
      wrapper
        .find("[data-test='renewal-toggles']")
        .text()
        .includes("my monthly subscription")
    ).toBe(true);
  });

  it("does not display renewal toggles when they should not be displayed", () => {
    queryClient.setQueryData("userSubscriptions", [
      userSubscriptionFactory.build({
        period: UserSubscriptionPeriod.Monthly,
        subscription_id: subscriptionID,
        statuses: userSubscriptionStatusesFactory.build({
          is_subscription_auto_renewing: true,
          should_present_auto_renewal: false,
        }),
      }),
      userSubscriptionFactory.build({
        period: UserSubscriptionPeriod.Yearly,
        subscription_id: "def",
        statuses: userSubscriptionStatusesFactory.build({
          is_subscription_auto_renewing: false,
          should_present_auto_renewal: false,
        }),
      }),
      userSubscriptionFactory.build({
        period: UserSubscriptionPeriod.Yearly,
        subscription_id: "ghi",
        statuses: userSubscriptionStatusesFactory.build({
          is_subscription_auto_renewing: false,
          should_present_auto_renewal: false,
        }),
      }),
    ]);
    const wrapper = mount(
      <QueryClientProvider client={queryClient}>
        <RenewalSettings
          positionNodeRef={{ current: null }}
          marketplace={UserSubscriptionMarketplace.CanonicalUA}
        />
      </QueryClientProvider>
    );
    // Open the menu so that the content gets rendered inside the portal.
    wrapper.find("Button.p-contextual-menu__toggle").simulate("click");
    expect(
      wrapper
        .find("[data-test='renewal-toggles']")
        .text()
        .includes("my monthly subscription")
    ).toBe(false);
    expect(
      wrapper
        .find("[data-test='renewal-toggles']")
        .text()
        .includes("my yearly subscription")
    ).toBe(false);
    expect(
      wrapper
        .find("[data-test='renewal-toggles']")
        .text()
        .includes("my 2 yearly subscriptions")
    ).toBe(false);
  });

  it("displays multiple subscriptions correctly", () => {
    queryClient.setQueryData("userSubscriptions", [
      userSubscriptionFactory.build({
        period: UserSubscriptionPeriod.Monthly,
        subscription_id: subscriptionID,
        price: 2500,
        number_of_machines: 2,
        current_number_of_machines: 2,
        statuses: userSubscriptionStatusesFactory.build({
          should_present_auto_renewal: true,
          is_subscription_auto_renewing: true,
        }),
      }),
      userSubscriptionFactory.build({
        period: UserSubscriptionPeriod.Monthly,
        subscription_id: "ghi",
        price: 250,
        number_of_machines: 100,
        current_number_of_machines: 100,
        statuses: userSubscriptionStatusesFactory.build({
          should_present_auto_renewal: true,
          is_subscription_auto_renewing: true,
        }),
      }),
      userSubscriptionFactory.build({
        period: UserSubscriptionPeriod.Yearly,
        subscription_id: "def",
        price: 10000,
        number_of_machines: 3,
        current_number_of_machines: 3,
        statuses: userSubscriptionStatusesFactory.build({
          should_present_auto_renewal: true,
          is_subscription_auto_renewing: true,
        }),
      }),
      userSubscriptionFactory.build({
        period: UserSubscriptionPeriod.Yearly,
        subscription_id: "jkl",
        price: 180000,
        number_of_machines: 1,
        current_number_of_machines: 1,
        statuses: userSubscriptionStatusesFactory.build({
          should_present_auto_renewal: true,
          is_subscription_auto_renewing: true,
        }),
      }),
    ]);
    const wrapper = mount(
      <QueryClientProvider client={queryClient}>
        <RenewalSettings
          positionNodeRef={{ current: null }}
          marketplace={UserSubscriptionMarketplace.CanonicalUA}
        />
      </QueryClientProvider>
    );
    // Open the menu so that the content gets rendered inside the portal.
    wrapper.find("Button.p-contextual-menu__toggle").simulate("click");
    const settings = wrapper.find("[data-test='renewal-toggles']").text();

    expect(
      settings.includes(
        `Renew my 2 yearly subscriptions for the next year for ` +
          `$1,900.00*. The renewal will happen on 9 July 2022: ` +
          `3x UA Applications - Standard (Physical)` +
          `1x UA Applications - Standard (Physical)`
      )
    ).toBe(true);
    expect(
      settings.includes(
        `Automatically renew my 2 monthly subscriptions every month` +
          ` for $27.50*. The next renewal will be on 9 July 2022: ` +
          `2x UA Applications - Standard (Physical)` +
          `100x UA Applications - Standard (Physical)`
      )
    ).toBe(true);
  });

  it("displays an error if there is a problem loading the subscriptions", async () => {
    getUserSubscriptionsSpy.mockImplementation(() => Promise.reject("Uh oh"));
    // Remove the current queries so that the hook attempts to refetch the subs.
    queryClient.removeQueries("userSubscriptions");
    const wrapper = mount(
      <QueryClientProvider client={queryClient}>
        <RenewalSettings
          positionNodeRef={{ current: null }}
          marketplace={UserSubscriptionMarketplace.CanonicalUA}
        />
      </QueryClientProvider>
    );
    // Use act to force waiting  for the component to finish rendering.
    await act(async () => {});
    // Open the menu so that the content gets rendered inside the portal.
    wrapper.find("Button.p-contextual-menu__toggle").simulate("click");
    expect(
      wrapper
        .find("Notification[data-test='subscriptions-loading-error']")
        .exists()
    ).toBe(true);
  });

  it("can update the auto-renewal setting for a subscription", async () => {
    queryClient.setQueryData("userSubscriptions", [
      userSubscriptionFactory.build({
        period: UserSubscriptionPeriod.Monthly,
        subscription_id: subscriptionID,
        statuses: userSubscriptionStatusesFactory.build({
          should_present_auto_renewal: true,
          is_subscription_auto_renewing: true,
        }),
      }),
    ]);

    const wrapper = mount(
      <QueryClientProvider client={queryClient}>
        <RenewalSettings
          positionNodeRef={{ current: null }}
          marketplace={UserSubscriptionMarketplace.CanonicalUA}
        />
      </QueryClientProvider>
    );
    // Open the menu so that the content gets rendered inside the portal.
    wrapper.find("Button.p-contextual-menu__toggle").simulate("click");
    wrapper.find(`input[name='${subscriptionID}']`).simulate("change", {
      target: { name: subscriptionID, value: false },
    });
    await act(async () => {
      wrapper.find("Formik form").simulate("submit");
    });
    const req: { [key: string]: boolean } = {};
    req[subscriptionID] = false;
    expect(setAutoRenewalSpy).toHaveBeenCalledWith(req);
  });

  it("displays errors if the setting can't be updated", async () => {
    queryClient.setQueryData("userSubscriptions", [
      userSubscriptionFactory.build({
        period: UserSubscriptionPeriod.Monthly,
        subscription_id: subscriptionID,
        statuses: userSubscriptionStatusesFactory.build({
          should_present_auto_renewal: true,
          is_subscription_auto_renewing: true,
        }),
      }),
    ]);
    setAutoRenewalSpy.mockImplementation(() =>
      Promise.resolve({ errors: "Uh oh" })
    );
    const wrapper = mount(
      <QueryClientProvider client={queryClient}>
        <RenewalSettings
          positionNodeRef={{ current: null }}
          marketplace={UserSubscriptionMarketplace.CanonicalUA}
        />
      </QueryClientProvider>
    );
    // Open the menu so that the content gets rendered inside the portal.
    wrapper.find("Button.p-contextual-menu__toggle").simulate("click");
    wrapper.find(`input[name='${subscriptionID}']`).simulate("change", {
      target: { name: subscriptionID, value: false },
    });
    await act(async () => {
      wrapper.find("Formik form").simulate("submit");
    });
    wrapper.update();
    const notification = wrapper.find(Notification);
    expect(notification.exists()).toBe(true);
    expect(notification.prop("data-test")).toBe("update-error");
    expect(notification.text().includes("Uh oh")).toBe(true);
  });

  it("resets the errors when the form is closed and reopened", async () => {
    queryClient.setQueryData("userSubscriptions", [
      userSubscriptionFactory.build({
        period: UserSubscriptionPeriod.Monthly,
        subscription_id: subscriptionID,
        statuses: userSubscriptionStatusesFactory.build({
          should_present_auto_renewal: true,
          is_subscription_auto_renewing: true,
        }),
      }),
    ]);
    setAutoRenewalSpy.mockImplementation(() =>
      Promise.resolve({ errors: "Uh oh" })
    );
    const wrapper = mount(
      <QueryClientProvider client={queryClient}>
        <RenewalSettings
          positionNodeRef={{ current: null }}
          marketplace={UserSubscriptionMarketplace.CanonicalUA}
        />
      </QueryClientProvider>
    );
    // Open the menu so that the content gets rendered inside the portal.
    wrapper.find("Button.p-contextual-menu__toggle").simulate("click");
    wrapper.find(`input[name='${subscriptionID}']`).simulate("change", {
      target: { name: subscriptionID, value: false },
    });
    await act(async () => {
      wrapper.find("Formik form").simulate("submit");
    });
    wrapper.update();
    expect(
      wrapper.find("Notification[data-test='update-error']").exists()
    ).toBe(true);
    // Close the menu.
    wrapper.find("Button[data-test='cancel-button']").simulate("click");
    // Open the menu again.
    wrapper.find("Button.p-contextual-menu__toggle").simulate("click");
    wrapper.update();
    expect(
      wrapper.find("Notification[data-test='update-error']").exists()
    ).toBe(false);
  });
});
