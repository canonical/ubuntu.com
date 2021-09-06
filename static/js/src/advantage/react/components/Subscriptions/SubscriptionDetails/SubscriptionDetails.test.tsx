import React from "react";
import { mount } from "enzyme";
import { QueryClient, QueryClientProvider } from "react-query";

import { freeSubscriptionFactory } from "advantage/tests/factories/api";
import SubscriptionDetails from "./SubscriptionDetails";
import { UserSubscription } from "advantage/api/types";
import SubscriptionEdit from "../SubscriptionEdit";

describe("SubscriptionDetails", () => {
  let queryClient: QueryClient;
  let contract: UserSubscription;

  beforeEach(async () => {
    queryClient = new QueryClient();
    contract = freeSubscriptionFactory.build();
    queryClient.setQueryData("userSubscriptions", [contract]);
  });

  it("initially shows the content", () => {
    const wrapper = mount(
      <QueryClientProvider client={queryClient}>
        <SubscriptionDetails onCloseModal={jest.fn()} />
      </QueryClientProvider>
    );
    expect(wrapper.find("DetailsContent").exists()).toBe(true);
    expect(wrapper.find("SubscriptionEdit").exists()).toBe(false);
  });

  // TODO: remove skip from these tests when the subscription details can load
  // non-free subscriptions.
  it.skip("can show the edit form", () => {
    const wrapper = mount(
      <QueryClientProvider client={queryClient}>
        <SubscriptionDetails onCloseModal={jest.fn()} />
      </QueryClientProvider>
    );
    wrapper.find("Button[data-test='edit-button']").simulate("click");
    expect(wrapper.find("SubscriptionEdit").exists()).toBe(true);
    expect(wrapper.find("DetailsContent").exists()).toBe(false);
  });

  // TODO: remove skip from these tests when the subscription details can load
  // non-free subscriptions.
  it.skip("disables the buttons when showing the edit form", () => {
    const wrapper = mount(
      <QueryClientProvider client={queryClient}>
        <SubscriptionDetails onCloseModal={jest.fn()} />
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
        <SubscriptionDetails onCloseModal={jest.fn()} />
      </QueryClientProvider>
    );
    expect(wrapper.find("[data-test='edit-button']").exists()).toBe(false);
    expect(wrapper.find("[data-test='support-button']").exists()).toBe(false);
    expect(wrapper.find("DetailsContent").exists()).toBe(true);
  });

  it("can close the modal", () => {
    const account = freeSubscriptionFactory.build();
    queryClient.setQueryData("userSubscriptions", [account]);
    const onCloseModal = jest.fn();
    const wrapper = mount(
      <QueryClientProvider client={queryClient}>
        <SubscriptionDetails onCloseModal={onCloseModal} />
      </QueryClientProvider>
    );
    wrapper.find(".p-modal__close").simulate("click");
    expect(onCloseModal).toHaveBeenCalled();
  });

  // TODO: remove skip from these tests when the subscription details can load
  // non-free subscriptions.
  it.skip("does not set the modal to active when the cancel modal is visible", () => {
    const onCloseModal = jest.fn();
    const wrapper = mount(
      <QueryClientProvider client={queryClient}>
        <SubscriptionDetails modalActive={true} onCloseModal={onCloseModal} />
      </QueryClientProvider>
    );
    // Open the edit modal:
    wrapper.find("[data-test='edit-button']").simulate("click");
    expect(wrapper.hasClass("is-active")).toBe(true);
    wrapper.find(SubscriptionEdit).invoke("setShowingCancel")(true);
    expect(wrapper.hasClass("is-active")).toBe(false);
  });
});
