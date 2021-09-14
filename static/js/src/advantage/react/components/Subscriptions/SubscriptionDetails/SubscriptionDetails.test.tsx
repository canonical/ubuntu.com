import React from "react";
import { mount } from "enzyme";
import { QueryClient, QueryClientProvider } from "react-query";

import {
  freeSubscriptionFactory,
  userSubscriptionFactory,
} from "advantage/tests/factories/api";
import SubscriptionDetails from "./SubscriptionDetails";
import { UserSubscription } from "advantage/api/types";
import SubscriptionEdit from "../SubscriptionEdit";

describe("SubscriptionDetails", () => {
  let queryClient: QueryClient;
  let contract: UserSubscription;

  beforeEach(async () => {
    queryClient = new QueryClient();
    contract = userSubscriptionFactory.build();
    queryClient.setQueryData("userSubscriptions", [contract]);
  });

  it("initially shows the content", () => {
    const wrapper = mount(
      <QueryClientProvider client={queryClient}>
        <SubscriptionDetails
          onCloseModal={jest.fn()}
          selectedId={contract.contract_id}
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
          selectedId={contract.contract_id}
        />
      </QueryClientProvider>
    );
    wrapper.find("Button[data-test='edit-button']").simulate("click");
    expect(wrapper.find("SubscriptionEdit").exists()).toBe(true);
    expect(wrapper.find("DetailsContent").exists()).toBe(false);
  });

  it("closes the edit form when changing subscriptions", () => {
    const contracts = [
      userSubscriptionFactory.build(),
      userSubscriptionFactory.build(),
      freeSubscriptionFactory.build(),
    ];
    queryClient.setQueryData("userSubscriptions", contracts);
    // Create a wrapping component to pass props to the inner
    // SubscriptionDetails component. This is needed so that setProps will
    // update the inner component.
    const ProxyComponent = ({ selectedId }: { selectedId: string }) => (
      <QueryClientProvider client={queryClient}>
        <SubscriptionDetails onCloseModal={jest.fn()} selectedId={selectedId} />
      </QueryClientProvider>
    );
    const wrapper = mount(
      <ProxyComponent selectedId={contracts[0].contract_id} />
    );
    wrapper.find("Button[data-test='edit-button']").simulate("click");
    expect(wrapper.find("SubscriptionEdit").exists()).toBe(true);
    expect(wrapper.find("DetailsContent").exists()).toBe(false);
    // The selected subscription state is handled in a parent component so
    // update the component with a different selected id to make the component
    // rerender with a new subscription:
    wrapper.setProps({ selectedId: contracts[1].contract_id });
    wrapper.update();
    expect(wrapper.find("SubscriptionEdit").exists()).toBe(false);
    expect(wrapper.find("DetailsContent").exists()).toBe(true);
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
          selectedId={contract.contract_id}
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
          selectedId={contract.contract_id}
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
        <SubscriptionDetails
          onCloseModal={jest.fn()}
          selectedId={account.contract_id}
        />
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
          selectedId={account.contract_id}
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
          selectedId={contract.contract_id}
        />
      </QueryClientProvider>
    );
    // Open the edit modal:
    wrapper.find("Button[data-test='edit-button']").simulate("click");
    expect(
      wrapper.find(".p-subscriptions__details").hasClass("is-active")
    ).toBe(true);
    wrapper.find(SubscriptionEdit).invoke("setShowingCancel")(true);
    expect(
      wrapper.find(".p-subscriptions__details").hasClass("is-active")
    ).toBe(false);
  });
});
