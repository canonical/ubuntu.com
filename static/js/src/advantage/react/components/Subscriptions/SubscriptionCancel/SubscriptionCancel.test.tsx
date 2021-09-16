import { ActionButton, Modal, Notification } from "@canonical/react-components";
import React from "react";
import { mount } from "enzyme";

import * as contracts from "advantage/api/contracts";
import SubscriptionCancel from "./SubscriptionCancel";
import { QueryClient, QueryClientProvider } from "react-query";
import {
  lastPurchaseIdsFactory,
  userSubscriptionFactory,
} from "advantage/tests/factories/api";
import { LastPurchaseIds, UserSubscription } from "advantage/api/types";
import { act } from "react-dom/test-utils";
import { UserSubscriptionPeriod } from "advantage/api/enum";

describe("SubscriptionCancel", () => {
  let cancelContractSpy: jest.SpyInstance;
  let queryClient: QueryClient;
  let subscription: UserSubscription;
  let lastPurchaseIds: LastPurchaseIds;

  beforeEach(() => {
    cancelContractSpy = jest.spyOn(contracts, "cancelContract");
    cancelContractSpy.mockImplementation(() => Promise.resolve({}));
    queryClient = new QueryClient();
    subscription = userSubscriptionFactory.build({
      period: UserSubscriptionPeriod.Monthly,
    });
    lastPurchaseIds = lastPurchaseIdsFactory.build();
    queryClient.setQueryData("userSubscriptions", [subscription]);
    queryClient.setQueryData(
      ["lastPurchaseIds", subscription.account_id],
      lastPurchaseIds
    );
  });

  afterAll(() => {
    jest.restoreAllMocks();
  });

  it("handles closing the modal", async () => {
    const onClose = jest.fn();
    const wrapper = mount(
      <QueryClientProvider client={queryClient}>
        <SubscriptionCancel
          selectedId={subscription.contract_id}
          onCancelSuccess={jest.fn()}
          onClose={onClose}
        />
      </QueryClientProvider>
    );
    await act(async () => {
      const close = wrapper.find(Modal).invoke("close");
      close && close();
    });
    expect(onClose).toHaveBeenCalled();
  });

  it("displays a spinner when loading the data", () => {
    queryClient.removeQueries("userSubscriptions");
    queryClient.removeQueries("lastPurchaseIds");
    const onClose = jest.fn();
    const wrapper = mount(
      <QueryClientProvider client={queryClient}>
        <SubscriptionCancel
          selectedId={subscription.contract_id}
          onCancelSuccess={jest.fn()}
          onClose={onClose}
        />
      </QueryClientProvider>
    );
    expect(wrapper.find("Spinner[data-test='form-loading']").exists()).toBe(
      true
    );
    expect(wrapper.find("Formik").exists()).toBe(false);
  });

  it("displays the form when the data has loaded", async () => {
    const wrapper = mount(
      <QueryClientProvider client={queryClient}>
        <SubscriptionCancel
          selectedId={subscription.contract_id}
          onCancelSuccess={jest.fn()}
          onClose={jest.fn()}
        />
      </QueryClientProvider>
    );
    await act(async () => {
      expect(wrapper.find("Spinner[data-test='form-loading']").exists()).toBe(
        false
      );
      expect(wrapper.find("Formik").exists()).toBe(true);
    });
  });

  it("disables the cancel button when the input does not contain the correct text", async () => {
    const wrapper = mount(
      <QueryClientProvider client={queryClient}>
        <SubscriptionCancel
          selectedId={subscription.contract_id}
          onCancelSuccess={jest.fn()}
          onClose={jest.fn()}
        />
      </QueryClientProvider>
    );
    await act(async () => {
      wrapper
        .find("input[name='cancel']")
        .simulate("change", { name: "cancel", value: "notcancel" });
    });
    wrapper.update();
    expect(wrapper.find(ActionButton).prop("disabled")).toBe(true);
  });

  it("enables the cancel button when the input contains the correct text", async () => {
    const wrapper = mount(
      <QueryClientProvider client={queryClient}>
        <SubscriptionCancel
          selectedId={subscription.contract_id}
          onCancelSuccess={jest.fn()}
          onClose={jest.fn()}
        />
      </QueryClientProvider>
    );
    await act(async () => {
      wrapper
        .find("input[name='cancel']")
        .simulate("change", { target: { name: "cancel", value: "cancel" } });
    });
    expect(wrapper.find(ActionButton).prop("disabled")).toBe(false);
  });

  it("disables submitting the form when the input does not contain the correct text", async () => {
    const wrapper = mount(
      <QueryClientProvider client={queryClient}>
        <SubscriptionCancel
          selectedId={subscription.contract_id}
          onCancelSuccess={jest.fn()}
          onClose={jest.fn()}
        />
      </QueryClientProvider>
    );
    await act(async () => {
      wrapper.find("Formik form").simulate("submit");
    });
    expect(cancelContractSpy).not.toHaveBeenCalled();
  });

  it("can submit the form via the cancel button", async () => {
    const wrapper = mount(
      <QueryClientProvider client={queryClient}>
        <SubscriptionCancel
          selectedId={subscription.contract_id}
          onCancelSuccess={jest.fn()}
          onClose={jest.fn()}
        />
      </QueryClientProvider>
    );
    await act(async () => {
      wrapper
        .find("input[name='cancel']")
        .simulate("change", { target: { name: "cancel", value: "cancel" } });
    });
    wrapper.update();
    await act(async () => {
      wrapper.find(ActionButton).simulate("click");
    });
    wrapper.update();
    expect(cancelContractSpy).toHaveBeenCalled();
  });

  it("calls the cancel-success callback when the cancel is successful", async () => {
    const onCancelSuccess = jest.fn();
    const wrapper = mount(
      <QueryClientProvider client={queryClient}>
        <SubscriptionCancel
          selectedId={subscription.contract_id}
          onCancelSuccess={onCancelSuccess}
          onClose={jest.fn()}
        />
      </QueryClientProvider>
    );
    await act(async () => {
      wrapper
        .find("input[name='cancel']")
        .simulate("change", { target: { name: "cancel", value: "cancel" } });
    });
    wrapper.update();
    await act(async () => {
      wrapper.find("Formik form").simulate("submit");
    });
    wrapper.update();
    expect(onCancelSuccess).toHaveBeenCalled();
  });

  it("can display an error when the subscription is missing", async () => {
    cancelContractSpy.mockImplementation(() =>
      Promise.resolve({ errors: "no monthly subscription" })
    );
    const onCancelSuccess = jest.fn();
    const wrapper = mount(
      <QueryClientProvider client={queryClient}>
        <SubscriptionCancel
          selectedId={subscription.contract_id}
          onCancelSuccess={onCancelSuccess}
          onClose={jest.fn()}
        />
      </QueryClientProvider>
    );
    await act(async () => {
      wrapper
        .find("input[name='cancel']")
        .simulate("change", { target: { name: "cancel", value: "cancel" } });
    });
    wrapper.update();
    await act(async () => {
      wrapper.find("Formik form").simulate("submit");
    });
    wrapper.update();
    const notification = wrapper.find(Notification);
    expect(notification.exists()).toBe(true);
    expect(notification.prop("data-test")).toBe("cancel-error");
    expect(notification.text().includes("you have a pending payment")).toBe(
      true
    );
  });

  it("can display an error when cancelling failed", async () => {
    cancelContractSpy.mockImplementation(() =>
      Promise.resolve({ errors: "Uh oh" })
    );
    const onCancelSuccess = jest.fn();
    const wrapper = mount(
      <QueryClientProvider client={queryClient}>
        <SubscriptionCancel
          selectedId={subscription.contract_id}
          onCancelSuccess={onCancelSuccess}
          onClose={jest.fn()}
        />
      </QueryClientProvider>
    );
    await act(async () => {
      wrapper
        .find("input[name='cancel']")
        .simulate("change", { target: { name: "cancel", value: "cancel" } });
    });
    wrapper.update();
    await act(async () => {
      wrapper.find("Formik form").simulate("submit");
    });
    wrapper.update();
    const notification = wrapper.find(Notification);
    expect(notification.exists()).toBe(true);
    expect(notification.prop("data-test")).toBe("cancel-error");
    expect(notification.text().includes("you have a pending payment")).toBe(
      false
    );
  });

  it("displays the action button success state when the cancel has finished", async () => {
    const wrapper = mount(
      <QueryClientProvider client={queryClient}>
        <SubscriptionCancel
          selectedId={subscription.contract_id}
          onCancelSuccess={jest.fn()}
          onClose={jest.fn()}
        />
      </QueryClientProvider>
    );
    await act(async () => {
      wrapper
        .find("input[name='cancel']")
        .simulate("change", { target: { name: "cancel", value: "cancel" } });
    });
    wrapper.update();
    await act(async () => {
      wrapper.find("Formik form").simulate("submit");
    });
    wrapper.update();
    expect(wrapper.find(ActionButton).prop("loading")).toBe(false);
    expect(wrapper.find(ActionButton).prop("success")).toBe(true);
  });
});
