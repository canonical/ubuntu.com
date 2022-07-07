import React from "react";
import { mount } from "enzyme";
import { QueryClient, QueryClientProvider } from "react-query";

import {
  freeSubscriptionFactory,
  userSubscriptionFactory,
  userSubscriptionStatusesFactory,
} from "advantage/tests/factories/api";
import SubscriptionDetails from "./SubscriptionDetails";
import { UserSubscription } from "advantage/api/types";
import SubscriptionEdit from "../SubscriptionEdit";
import { Notification } from "@canonical/react-components";
import * as usePendingPurchase from "advantage/subscribe/react/hooks/usePendingPurchase";

describe("SubscriptionDetails", () => {
  let queryClient: QueryClient;
  let contract: UserSubscription;

  beforeEach(() => {
    queryClient = new QueryClient();
    // Mock the pending purchases hook so that stripe does not need to be set up.
    const usePendingPurchaseSpy: jest.SpyInstance = jest.spyOn(
      usePendingPurchase,
      "default"
    );
    usePendingPurchaseSpy.mockImplementation(() => ({
      setPendingPurchaseID: jest.fn(),
    }));
    contract = userSubscriptionFactory.build({
      statuses: userSubscriptionStatusesFactory.build({
        is_upsizeable: true,
      }),
    });
    queryClient.setQueryData("userSubscriptions", [contract]);
  });

  it("initially shows the content", () => {
    const wrapper = mount(
      <QueryClientProvider client={queryClient}>
        <SubscriptionDetails
          onCloseModal={jest.fn()}
          selectedId={contract.id}
        />
      </QueryClientProvider>
    );
    expect(wrapper.find("DetailsContent").exists()).toBe(true);
    expect(wrapper.find("SubscriptionEdit").exists()).toBe(false);
  });

  it("can show the edit form", () => {
    const wrapper = mount(
      <QueryClientProvider client={queryClient}>
        <SubscriptionDetails
          onCloseModal={jest.fn()}
          selectedId={contract.id}
        />
      </QueryClientProvider>
    );
    wrapper.find("Button[data-test='edit-button']").simulate("click");
    expect(wrapper.find("SubscriptionEdit").exists()).toBe(true);
    expect(wrapper.find("DetailsContent").exists()).toBe(false);
  });

  it("can show the support button", () => {
    const wrapper = mount(
      <QueryClientProvider client={queryClient}>
        <SubscriptionDetails
          onCloseModal={jest.fn()}
          selectedId={contract.id}
        />
      </QueryClientProvider>
    );
    expect(wrapper.find("Button[data-test='support-button']").exists()).toBe(
      true
    );
  });

  it("cannot show the support button", () => {
    const contract = userSubscriptionFactory.build({
      statuses: userSubscriptionStatusesFactory.build({
        has_access_to_support: false,
      }),
    });

    queryClient.setQueryData("userSubscriptions", [contract]);

    const wrapper = mount(
      <QueryClientProvider client={queryClient}>
        <SubscriptionDetails
          onCloseModal={jest.fn()}
          selectedId={contract.id}
        />
      </QueryClientProvider>
    );
    expect(wrapper.find("Button[data-test='support-button']").exists()).toBe(
      false
    );
  });

  it("closes the edit form when closing the modal", () => {
    // Create a wrapping component to pass props to the inner
    // SubscriptionDetails component. This is needed so that setProps will
    // update the inner component.
    const ProxyComponent = ({ modalActive }: { modalActive: boolean }) => (
      <QueryClientProvider client={queryClient}>
        <SubscriptionDetails
          modalActive={modalActive}
          onCloseModal={jest.fn()}
          selectedId={contract.id}
        />
      </QueryClientProvider>
    );
    const wrapper = mount(<ProxyComponent modalActive={true} />);
    wrapper.find("Button[data-test='edit-button']").simulate("click");
    expect(wrapper.find("SubscriptionEdit").exists()).toBe(true);
    expect(wrapper.find("DetailsContent").exists()).toBe(false);
    wrapper.setProps({ modalActive: false });
    wrapper.update();
    expect(wrapper.find("SubscriptionEdit").exists()).toBe(false);
    expect(wrapper.find("DetailsContent").exists()).toBe(true);
  });

  it("disables the buttons when showing the edit form", () => {
    const wrapper = mount(
      <QueryClientProvider client={queryClient}>
        <SubscriptionDetails
          onCloseModal={jest.fn()}
          selectedId={contract.id}
        />
      </QueryClientProvider>
    );
    expect(
      wrapper.find("Button[data-test='edit-button']").prop("disabled")
    ).toBe(false);
    expect(
      wrapper.find("Button[data-test='support-button']").prop("disabled")
    ).toBe(false);
    wrapper.find("Button[data-test='edit-button']").simulate("click");
    expect(
      wrapper.find("Button[data-test='edit-button']").prop("disabled")
    ).toBe(true);
    expect(
      wrapper.find("Button[data-test='support-button']").prop("disabled")
    ).toBe(true);
  });

  it("does not display the buttons for a free contract", () => {
    const account = freeSubscriptionFactory.build();
    queryClient.setQueryData("userSubscriptions", [account]);
    const wrapper = mount(
      <QueryClientProvider client={queryClient}>
        <SubscriptionDetails onCloseModal={jest.fn()} selectedId={account.id} />
      </QueryClientProvider>
    );
    expect(wrapper.find("Button[data-test='edit-button']").exists()).toBe(
      false
    );
    expect(wrapper.find("[data-test='support-button']").exists()).toBe(false);
    expect(wrapper.find("DetailsContent").exists()).toBe(true);
  });

  it("can close the modal", () => {
    const account = freeSubscriptionFactory.build();
    queryClient.setQueryData("userSubscriptions", [account]);
    const onCloseModal = jest.fn();
    const wrapper = mount(
      <QueryClientProvider client={queryClient}>
        <SubscriptionDetails
          onCloseModal={onCloseModal}
          selectedId={account.id}
        />
      </QueryClientProvider>
    );
    wrapper.find(".p-modal__close").simulate("click");
    expect(onCloseModal).toHaveBeenCalled();
  });

  it("does not set the modal to active when the cancel modal is visible", () => {
    const onCloseModal = jest.fn();
    const wrapper = mount(
      <QueryClientProvider client={queryClient}>
        <SubscriptionDetails
          modalActive={true}
          onCloseModal={onCloseModal}
          selectedId={contract.id}
        />
      </QueryClientProvider>
    );
    // Open the edit form:
    wrapper.find("Button[data-test='edit-button']").simulate("click");
    expect(
      wrapper.find(".p-subscriptions__details").hasClass("is-active")
    ).toBe(true);
    wrapper.find(SubscriptionEdit).invoke("setShowingCancel")(true);
    expect(
      wrapper.find(".p-subscriptions__details").hasClass("is-active")
    ).toBe(false);
  });

  it("can show a notification", () => {
    const wrapper = mount(
      <QueryClientProvider client={queryClient}>
        <SubscriptionDetails
          onCloseModal={jest.fn()}
          selectedId={contract.id}
        />
      </QueryClientProvider>
    );
    // Open the edit form:
    wrapper.find("Button[data-test='edit-button']").simulate("click");
    wrapper.find(SubscriptionEdit).invoke("setNotification")({
      title: "Test notification",
    });
    const notification = wrapper.find(Notification);
    expect(notification.exists()).toBe(true);
    expect(notification.prop("title")).toBe("Test notification");
  });

  it("shows a notification when the current number of machine is lower than the number of machines", () => {
    const contract = userSubscriptionFactory.build({
      current_number_of_machines: 15,
      number_of_machines: 20,
    });

    queryClient.setQueryData("userSubscriptions", [contract]);
    const wrapper = mount(
      <QueryClientProvider client={queryClient}>
        <SubscriptionDetails
          onCloseModal={jest.fn()}
          selectedId={contract.id}
        />
      </QueryClientProvider>
    );

    const notification = wrapper.find(Notification);
    expect(notification.exists()).toBe(true);
    expect(notification.prop("severity")).toBe("caution");
    expect(wrapper.find(".p-notification__message").text()).toBe(
      "The machine entitlement below will update to 15 at the next billing cycle on 10 Jul 2022."
    );
  });

  it("shows the cance trial button if the subscription is a trial", () => {
    const contract = userSubscriptionFactory.build({
      statuses: userSubscriptionStatusesFactory.build({
        is_trialled: true,
      }),
    });

    queryClient.setQueryData("userSubscriptions", [contract]);

    const wrapper = mount(
      <QueryClientProvider client={queryClient}>
        <SubscriptionDetails
          onCloseModal={jest.fn()}
          selectedId={contract.id}
        />
      </QueryClientProvider>
    );
    expect(
      wrapper.find("Button[data-test='cancel-trial-button']").exists()
    ).toBe(true);
  });
});
