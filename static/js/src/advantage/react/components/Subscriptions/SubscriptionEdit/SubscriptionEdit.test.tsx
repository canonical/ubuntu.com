import React from "react";
import { act } from "react-dom/test-utils";
import { QueryClient, QueryClientProvider } from "react-query";
import { mount } from "enzyme";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import * as contracts from "advantage/api/contracts";
import { LastPurchaseIds, UserSubscription } from "advantage/api/types";
import * as usePollPurchaseStatus from "advantage/subscribe/checkout/hooks/usePollPurchaseStatus";
import {
  lastPurchaseIdsFactory,
  userSubscriptionFactory,
  userSubscriptionStatusesFactory,
} from "advantage/tests/factories/api";
import SubscriptionEdit, { generateSchema } from "./SubscriptionEdit";

describe("SubscriptionEdit", () => {
  let queryClient: QueryClient;
  let subscription: UserSubscription;
  let resizeContractSpy: jest.SpyInstance;
  let getPurchaseSpy: jest.SpyInstance;
  let usePollPurchaseStatusSpy: jest.SpyInstance;
  let lastPurchaseIds: LastPurchaseIds;

  beforeEach(async () => {
    resizeContractSpy = jest.spyOn(contracts, "resizeContract");
    resizeContractSpy.mockImplementation(() => Promise.resolve({}));
    getPurchaseSpy = jest.spyOn(contracts, "getPurchase");
    getPurchaseSpy.mockImplementation(() => Promise.resolve({}));
    // Mock the pending purchases hook so that stripe does not need to be set up.
    usePollPurchaseStatusSpy = jest.spyOn(usePollPurchaseStatus, "default");
    usePollPurchaseStatusSpy.mockImplementation(() => ({
      setPendingPurchaseID: jest.fn(),
    }));
    queryClient = new QueryClient();
    subscription = userSubscriptionFactory.build({
      number_of_machines: 1,
      statuses: userSubscriptionStatusesFactory.build({
        is_cancellable: true,
        is_upsizeable: true,
        is_downsizeable: true,
      }),
    });
    lastPurchaseIds = lastPurchaseIdsFactory.build();
    queryClient.setQueryData("userSubscriptions", [subscription]);
    queryClient.setQueryData(
      ["lastPurchaseIds", subscription.account_id],
      lastPurchaseIds
    );
  });

  it("shows a cancel link if the subscription is cancellable", async () => {
    const wrapper = mount(
      <QueryClientProvider client={queryClient}>
        <SubscriptionEdit
          onClose={jest.fn()}
          selectedId={subscription.id}
          setNotification={jest.fn()}
          setShowingCancel={jest.fn()}
        />
      </QueryClientProvider>
    );
    await act(async () => {});
    expect(wrapper.find("Button[data-test='cancel-button']").exists()).toBe(
      true
    );
  });

  it("does not show a cancel link if the subscription is not cancellable", async () => {
    subscription = userSubscriptionFactory.build({
      statuses: userSubscriptionStatusesFactory.build({
        is_cancellable: false,
      }),
    });
    queryClient.setQueryData("userSubscriptions", [subscription]);
    const wrapper = mount(
      <QueryClientProvider client={queryClient}>
        <SubscriptionEdit
          onClose={jest.fn()}
          selectedId={subscription.id}
          setNotification={jest.fn()}
          setShowingCancel={jest.fn()}
        />
      </QueryClientProvider>
    );
    await act(async () => {});
    expect(wrapper.find("Button[data-test='cancel-button']").exists()).toBe(
      false
    );
  });

  it("initially hides the cancel modal", async () => {
    const wrapper = mount(
      <QueryClientProvider client={queryClient}>
        <SubscriptionEdit
          onClose={jest.fn()}
          selectedId={subscription.id}
          setNotification={jest.fn()}
          setShowingCancel={jest.fn()}
        />
      </QueryClientProvider>
    );
    await act(async () => {});
    expect(wrapper.find("SubscriptionCancel").exists()).toBe(false);
  });

  it("can show the cancel modal", async () => {
    const setShowingCancel = jest.fn();
    const wrapper = mount(
      <QueryClientProvider client={queryClient}>
        <SubscriptionEdit
          onClose={jest.fn()}
          selectedId={subscription.id}
          setNotification={jest.fn()}
          setShowingCancel={setShowingCancel}
        />
      </QueryClientProvider>
    );
    // The portal currently requires a fake event, this should be able to be
    // removed when this issue is resolved:
    // https://github.com/alex-cory/react-useportal/issues/36
    const fakeEvent = { currentTarget: true };
    await act(async () => {
      wrapper
        .find("Button[data-test='cancel-button']")
        .simulate("click", fakeEvent);
    });
    wrapper.update();
    expect(wrapper.find("SubscriptionCancel").exists()).toBe(true);
    expect(setShowingCancel).toHaveBeenCalledWith(true);
  });

  it("resizes the subscription when the form is submitted", async () => {
    resizeContractSpy.mockImplementation(() => Promise.resolve({ id: 123 }));
    const setPendingPurchaseID = jest.fn();
    usePollPurchaseStatusSpy.mockImplementation(() => ({
      isSuccess: true,
      setPendingPurchaseID,
    }));
    const wrapper = mount(
      <QueryClientProvider client={queryClient}>
        <SubscriptionEdit
          onClose={jest.fn()}
          selectedId={subscription.id}
          setNotification={jest.fn()}
          setShowingCancel={jest.fn()}
        />
      </QueryClientProvider>
    );
    await act(async () => {
      wrapper
        .find("input[name='size']")
        .simulate("change", { name: "size", value: 6 });
      wrapper.find("Formik form").simulate("submit");
    });
    wrapper.update();
    expect(resizeContractSpy).toHaveBeenCalled();
    expect(setPendingPurchaseID).toHaveBeenCalledWith(123);
  });

  it("disables submit and cancel buttons when the form is submitted", async () => {
    resizeContractSpy.mockImplementation(() => new Promise(jest.fn()));
    const setPendingPurchaseID = jest.fn();
    usePollPurchaseStatusSpy.mockImplementation(() => ({
      isSuccess: true,
      setPendingPurchaseID,
    }));
    render(
      <QueryClientProvider client={queryClient}>
        <SubscriptionEdit
          onClose={jest.fn()}
          selectedId={subscription.id}
          setNotification={jest.fn()}
          setShowingCancel={jest.fn()}
        />
      </QueryClientProvider>
    );
    userEvent.type(screen.getByLabelText("Number of machines"), "6");

    expect(screen.getByTestId("resize-submit-button")).not.toBeDisabled();
    expect(screen.getByRole("button", { name: "Cancel" })).not.toBeDisabled();
    userEvent.click(screen.getByRole("button", { name: "Resize" }));
    await waitFor(() =>
      expect(screen.queryByTestId("resize-submit-button")).toBeDisabled()
    );
    expect(screen.queryByRole("button", { name: "Cancel" })).toBeDisabled();
  });

  it("invalidates queries when the resize is successful", async () => {
    resizeContractSpy.mockImplementation(() => Promise.resolve({ id: 123 }));
    getPurchaseSpy.mockImplementation(() =>
      Promise.resolve({ stripeInvoices: [{ status: "done" }] })
    );
    usePollPurchaseStatusSpy.mockImplementation(() => ({
      isSuccess: true,
      setPendingPurchaseID: jest.fn(),
    }));
    const wrapper = mount(
      <QueryClientProvider client={queryClient}>
        <SubscriptionEdit
          onClose={jest.fn()}
          selectedId={subscription.id}
          setNotification={jest.fn()}
          setShowingCancel={jest.fn()}
        />
      </QueryClientProvider>
    );
    let userSubscriptionsState = queryClient.getQueryState("userSubscriptions");
    let lastPurchaseIdsState = queryClient.getQueryState([
      "lastPurchaseIds",
      subscription.account_id,
    ]);
    expect(userSubscriptionsState?.isInvalidated).toBe(false);
    expect(lastPurchaseIdsState?.isInvalidated).toBe(false);
    await act(async () => {
      wrapper
        .find("input[name='size']")
        .simulate("change", { name: "size", value: 6 });
      wrapper.find("Formik form").simulate("submit");
    });
    wrapper.update();
    userSubscriptionsState = queryClient.getQueryState("userSubscriptions");
    lastPurchaseIdsState = queryClient.getQueryState([
      "lastPurchaseIds",
      subscription.account_id,
    ]);
    expect(userSubscriptionsState?.isInvalidated).toBe(true);
    expect(lastPurchaseIdsState?.isInvalidated).toBe(true);
  });

  it("closes the form when the resize is successful", async () => {
    const onClose = jest.fn();
    const setNotification = jest.fn();
    resizeContractSpy.mockImplementation(() => Promise.resolve({ id: 123 }));
    getPurchaseSpy.mockImplementation(() =>
      Promise.resolve({ stripeInvoices: [{ status: "done" }] })
    );
    usePollPurchaseStatusSpy.mockImplementation(() => ({
      isSuccess: true,
      setPendingPurchaseID: jest.fn(),
    }));
    const wrapper = mount(
      <QueryClientProvider client={queryClient}>
        <SubscriptionEdit
          onClose={onClose}
          selectedId={subscription.id}
          setNotification={setNotification}
          setShowingCancel={jest.fn()}
        />
      </QueryClientProvider>
    );
    await act(async () => {
      wrapper
        .find("input[name='size']")
        .simulate("change", { name: "size", value: 6 });
      wrapper.find("Formik form").simulate("submit");
    });
    expect(onClose).toHaveBeenCalled();
    expect(setNotification).toHaveBeenCalled();
  });

  it("can display an error when there's a pending purchase", async () => {
    resizeContractSpy.mockImplementation(() =>
      Promise.resolve({ errors: "can only make one purchase" })
    );
    const wrapper = mount(
      <QueryClientProvider client={queryClient}>
        <SubscriptionEdit
          onClose={jest.fn()}
          selectedId={subscription.id}
          setNotification={jest.fn()}
          setShowingCancel={jest.fn()}
        />
      </QueryClientProvider>
    );
    await act(async () => {
      wrapper
        .find("input[name='size']")
        .simulate("change", { name: "size", value: 6 });
      wrapper.find("Formik form").simulate("submit");
    });
    wrapper.update();
    expect(
      wrapper.find("[data-test='has-pending-purchase-error']").exists()
    ).toBe(true);
  });

  it("can display an error when there's an unknown payment error", async () => {
    resizeContractSpy.mockImplementation(() =>
      Promise.resolve({ errors: "unknown error" })
    );
    const wrapper = mount(
      <QueryClientProvider client={queryClient}>
        <SubscriptionEdit
          onClose={jest.fn()}
          selectedId={subscription.id}
          setNotification={jest.fn()}
          setShowingCancel={jest.fn()}
        />
      </QueryClientProvider>
    );
    await act(async () => {
      wrapper
        .find("input[name='size']")
        .simulate("change", { name: "size", value: 6 });
      wrapper.find("Formik form").simulate("submit");
    });
    wrapper.update();
    expect(wrapper.find("[data-test='payment-error']").exists()).toBe(true);
  });

  describe("generateSchema", () => {
    it("allows a downsizable sub to enter a lower number", async () => {
      subscription = userSubscriptionFactory.build({
        current_number_of_machines: 5,
        statuses: userSubscriptionStatusesFactory.build({
          is_downsizeable: true,
        }),
      });
      const isValid = await generateSchema(subscription, "machine").isValid({
        size: 4,
      });
      expect(isValid).toBe(true);
    });

    it("does not allow downsizable sub to enter less than 1", async () => {
      subscription = userSubscriptionFactory.build({
        current_number_of_machines: 5,
        statuses: userSubscriptionStatusesFactory.build({
          is_downsizeable: true,
        }),
      });
      const isValid = await generateSchema(subscription, "machine").isValid({
        size: 0,
      });
      expect(isValid).toBe(false);
    });

    it("does not allow a non downsizable sub to enter a lower number", async () => {
      subscription = userSubscriptionFactory.build({
        current_number_of_machines: 5,
        statuses: userSubscriptionStatusesFactory.build({
          is_downsizeable: false,
        }),
      });
      const isValid = await generateSchema(subscription, "machine").isValid({
        size: 4,
      });
      expect(isValid).toBe(false);
    });

    it("allows an upsizable sub to enter a higher number", async () => {
      subscription = userSubscriptionFactory.build({
        current_number_of_machines: 5,
        statuses: userSubscriptionStatusesFactory.build({
          is_upsizeable: true,
        }),
      });
      const isValid = await generateSchema(subscription, "machine").isValid({
        size: 6,
      });
      expect(isValid).toBe(true);
    });

    it("does not allow a non upsizable sub to enter a higher number", async () => {
      subscription = userSubscriptionFactory.build({
        current_number_of_machines: 5,
        statuses: userSubscriptionStatusesFactory.build({
          is_upsizeable: false,
        }),
      });
      const isValid = await generateSchema(subscription, "machine").isValid({
        size: 6,
      });
      expect(isValid).toBe(false);
    });
  });
});
