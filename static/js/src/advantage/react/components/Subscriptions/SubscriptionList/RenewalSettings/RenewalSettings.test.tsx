import React from "react";
import { mount } from "enzyme";
import fetch from "jest-fetch-mock";

import RenewalSettings from "./RenewalSettings";
import { UserInfo, UserSubscription } from "advantage/api/types";
import { QueryClient, QueryClientProvider } from "react-query";
import {
  userInfoFactory,
  userSubscriptionFactory,
  userSubscriptionStatusesFactory,
} from "advantage/tests/factories/api";
import { UserSubscriptionPeriod } from "advantage/api/enum";
import * as contracts from "advantage/api/contracts";
import { act } from "react-dom/test-utils";
import { Notification } from "@canonical/react-components";

describe("RenewalSettings", () => {
  let queryClient: QueryClient;
  let contract: UserSubscription;
  let userInfo: UserInfo;
  let getUserInfoSpy: jest.SpyInstance;
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
    contract = userSubscriptionFactory.build({
      period: UserSubscriptionPeriod.Monthly,
    });
    userInfo = userInfoFactory.build({
      is_auto_renewing: true,
    });
    queryClient.setQueryData("userSubscriptions", [contract]);
    queryClient.setQueryData("userInfo", userInfo);
    getUserInfoSpy = jest.spyOn(contracts, "getUserInfo");
    getUserSubscriptionsSpy = jest.spyOn(contracts, "getUserSubscriptions");
    setAutoRenewalSpy = jest.spyOn(contracts, "setAutoRenewal");
    setAutoRenewalSpy.mockImplementation(() => Promise.resolve({}));
  });

  afterAll(() => {
    jest.restoreAllMocks();
  });

  it("displays the correct plural for 1 monthly subscription", () => {
    queryClient.setQueryData("userSubscriptions", [
      userSubscriptionFactory.build({
        period: UserSubscriptionPeriod.Monthly,
      }),
      userSubscriptionFactory.build({
        period: UserSubscriptionPeriod.Yearly,
      }),
    ]);
    const wrapper = mount(
      <QueryClientProvider client={queryClient}>
        <RenewalSettings positionNodeRef={{ current: null }} />
      </QueryClientProvider>
    );
    // Open the menu so that the content gets rendered inside the portal.
    wrapper.find("Button.p-contextual-menu__toggle").simulate("click");
    expect(
      wrapper
        .find("[data-test='subscription-count']")
        .text()
        .includes("1 monthly subscription is")
    ).toBe(true);
  });

  it("does not include expired subscriptions in the count", () => {
    queryClient.setQueryData("userSubscriptions", [
      userSubscriptionFactory.build({
        period: UserSubscriptionPeriod.Monthly,
      }),
      userSubscriptionFactory.build({
        period: UserSubscriptionPeriod.Monthly,
        statuses: userSubscriptionStatusesFactory.build({ is_expired: true }),
      }),
    ]);
    const wrapper = mount(
      <QueryClientProvider client={queryClient}>
        <RenewalSettings positionNodeRef={{ current: null }} />
      </QueryClientProvider>
    );
    // Open the menu so that the content gets rendered inside the portal.
    wrapper.find("Button.p-contextual-menu__toggle").simulate("click");
    expect(
      wrapper
        .find("[data-test='subscription-count']")
        .text()
        .includes("1 monthly subscription is")
    ).toBe(true);
  });

  it("does not include cancelled subscriptions in the count", () => {
    queryClient.setQueryData("userSubscriptions", [
      userSubscriptionFactory.build({
        period: UserSubscriptionPeriod.Monthly,
      }),
      userSubscriptionFactory.build({
        period: UserSubscriptionPeriod.Monthly,
        statuses: userSubscriptionStatusesFactory.build({ is_cancelled: true }),
      }),
    ]);
    const wrapper = mount(
      <QueryClientProvider client={queryClient}>
        <RenewalSettings positionNodeRef={{ current: null }} />
      </QueryClientProvider>
    );
    // Open the menu so that the content gets rendered inside the portal.
    wrapper.find("Button.p-contextual-menu__toggle").simulate("click");
    expect(
      wrapper
        .find("[data-test='subscription-count']")
        .text()
        .includes("1 monthly subscription is")
    ).toBe(true);
  });

  it("displays the correct plural for multiple monthly subscriptions", () => {
    queryClient.setQueryData("userSubscriptions", [
      userSubscriptionFactory.build({
        period: UserSubscriptionPeriod.Monthly,
      }),
      userSubscriptionFactory.build({
        period: UserSubscriptionPeriod.Monthly,
      }),
      userSubscriptionFactory.build({
        period: UserSubscriptionPeriod.Yearly,
      }),
    ]);
    const wrapper = mount(
      <QueryClientProvider client={queryClient}>
        <RenewalSettings positionNodeRef={{ current: null }} />
      </QueryClientProvider>
    );
    // Open the menu so that the content gets rendered inside the portal.
    wrapper.find("Button.p-contextual-menu__toggle").simulate("click");
    expect(
      wrapper
        .find("[data-test='subscription-count']")
        .text()
        .includes("2 monthly subscriptions are")
    ).toBe(true);
  });

  it("formats the date", () => {
    queryClient.setQueryData(
      "userInfo",
      userInfoFactory.build({
        next_payment_date: new Date("2023-02-09T07:14:56Z"),
      })
    );
    const wrapper = mount(
      <QueryClientProvider client={queryClient}>
        <RenewalSettings positionNodeRef={{ current: null }} />
      </QueryClientProvider>
    );
    // Open the menu so that the content gets rendered inside the portal.
    wrapper.find("Button.p-contextual-menu__toggle").simulate("click");
    expect(wrapper.find("[data-test='next-payment-date']").text()).toBe(
      "9 February 2023"
    );
  });

  it("formats the price", () => {
    queryClient.setQueryData(
      "userInfo",
      userInfoFactory.build({
        total: 2200,
      })
    );
    const wrapper = mount(
      <QueryClientProvider client={queryClient}>
        <RenewalSettings positionNodeRef={{ current: null }} />
      </QueryClientProvider>
    );
    // Open the menu so that the content gets rendered inside the portal.
    wrapper.find("Button.p-contextual-menu__toggle").simulate("click");
    expect(wrapper.find("[data-test='monthly-price']").text()).toBe("$22.00");
  });

  it("sets the inital auto renew value from the API response", async () => {
    userInfo = userInfoFactory.build({
      is_auto_renewing: true,
    });
    queryClient.setQueryData("userInfo", userInfo);
    const wrapper = mount(
      <QueryClientProvider client={queryClient}>
        <RenewalSettings positionNodeRef={{ current: null }} />
      </QueryClientProvider>
    );
    // Use act to force waiting  for the component to finish rendering.
    await act(async () => {});
    // Open the menu so that the content gets rendered inside the portal.
    wrapper.find("Button.p-contextual-menu__toggle").simulate("click");
    expect(wrapper.find("input[name='shouldAutoRenew']").prop("checked")).toBe(
      true
    );
  });

  it("displays an error if there is a problem loading the user info", async () => {
    getUserInfoSpy.mockImplementation(() => Promise.reject("Uh oh"));
    // Remove the current queries so that the hook attempts to refetch the user info.
    queryClient.removeQueries("userInfo");
    const wrapper = mount(
      <QueryClientProvider client={queryClient}>
        <RenewalSettings positionNodeRef={{ current: null }} />
      </QueryClientProvider>
    );
    // Use act to force waiting  for the component to finish rendering.
    await act(async () => {});
    // Open the menu so that the content gets rendered inside the portal.
    wrapper.find("Button.p-contextual-menu__toggle").simulate("click");
    expect(
      wrapper.find("Notification[data-test='user-info-loading-error']").exists()
    ).toBe(true);
  });

  it("displays an error if there is a problem loading the subscriptions", async () => {
    getUserSubscriptionsSpy.mockImplementation(() => Promise.reject("Uh oh"));
    // Remove the current queries so that the hook attempts to refetch the subs.
    queryClient.removeQueries("userSubscriptions");
    const wrapper = mount(
      <QueryClientProvider client={queryClient}>
        <RenewalSettings positionNodeRef={{ current: null }} />
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

  it("displays the next payment message when auto renew is on", async () => {
    userInfo = userInfoFactory.build({
      next_payment_date: new Date("2022-02-09T07:14:56Z"),
    });
    queryClient.setQueryData("userInfo", userInfo);
    const wrapper = mount(
      <QueryClientProvider client={queryClient}>
        <RenewalSettings positionNodeRef={{ current: null }} />
      </QueryClientProvider>
    );
    // Use act to force waiting  for the component to finish rendering.
    await act(async () => {});
    // Open the menu so that the content gets rendered inside the portal.
    wrapper.find("Button.p-contextual-menu__toggle").simulate("click");
    expect(wrapper.find("[data-test='next-payment']").exists()).toBe(true);
  });

  it("does not display the next payment message when auto renew is off", async () => {
    userInfo = userInfoFactory.build({
      next_payment_date: "",
    });
    queryClient.setQueryData("userInfo", userInfo);
    const wrapper = mount(
      <QueryClientProvider client={queryClient}>
        <RenewalSettings positionNodeRef={{ current: null }} />
      </QueryClientProvider>
    );
    // Use act to force waiting  for the component to finish rendering.
    await act(async () => {});
    // Open the menu so that the content gets rendered inside the portal.
    wrapper.find("Button.p-contextual-menu__toggle").simulate("click");
    expect(wrapper.find("[data-test='next-payment']").exists()).toBe(false);
  });

  it("can update the setting", async () => {
    const wrapper = mount(
      <QueryClientProvider client={queryClient}>
        <RenewalSettings positionNodeRef={{ current: null }} />
      </QueryClientProvider>
    );
    // Open the menu so that the content gets rendered inside the portal.
    wrapper.find("Button.p-contextual-menu__toggle").simulate("click");
    wrapper.find("input[name='shouldAutoRenew']").simulate("change", {
      target: { name: "shouldAutoRenew", value: false },
    });
    await act(async () => {
      wrapper.find("Formik form").simulate("submit");
    });
    expect(setAutoRenewalSpy).toHaveBeenCalledWith(false);
  });

  it("displays errors if the setting can't be updated", async () => {
    setAutoRenewalSpy.mockImplementation(() =>
      Promise.resolve({ errors: "Uh oh" })
    );
    const wrapper = mount(
      <QueryClientProvider client={queryClient}>
        <RenewalSettings positionNodeRef={{ current: null }} />
      </QueryClientProvider>
    );
    // Open the menu so that the content gets rendered inside the portal.
    wrapper.find("Button.p-contextual-menu__toggle").simulate("click");
    wrapper.find("input[name='shouldAutoRenew']").simulate("change", {
      target: { name: "shouldAutoRenew", value: false },
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
    setAutoRenewalSpy.mockImplementation(() =>
      Promise.resolve({ errors: "Uh oh" })
    );
    const wrapper = mount(
      <QueryClientProvider client={queryClient}>
        <RenewalSettings positionNodeRef={{ current: null }} />
      </QueryClientProvider>
    );
    // Open the menu so that the content gets rendered inside the portal.
    wrapper.find("Button.p-contextual-menu__toggle").simulate("click");
    wrapper.find("input[name='shouldAutoRenew']").simulate("change", {
      target: { name: "shouldAutoRenew", value: false },
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
