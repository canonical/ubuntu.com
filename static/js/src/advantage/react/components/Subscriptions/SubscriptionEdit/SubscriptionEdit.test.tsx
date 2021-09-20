import React from "react";
import { mount } from "enzyme";

import SubscriptionEdit from "./SubscriptionEdit";
import { QueryClient, QueryClientProvider } from "react-query";
import { UserSubscription } from "advantage/api/types";
import {
  userSubscriptionFactory,
  userSubscriptionStatusesFactory,
} from "advantage/tests/factories/api";
import { act } from "react-dom/test-utils";

describe("SubscriptionEdit", () => {
  let queryClient: QueryClient;
  let subscription: UserSubscription;

  beforeEach(async () => {
    queryClient = new QueryClient();
    subscription = userSubscriptionFactory.build({
      statuses: userSubscriptionStatusesFactory.build({ is_cancellable: true }),
    });
    queryClient.setQueryData("userSubscriptions", [subscription]);
  });

  it("shows a cancel link if the subscription is cancellable", () => {
    const wrapper = mount(
      <QueryClientProvider client={queryClient}>
        <SubscriptionEdit
          onClose={jest.fn()}
          selectedId={subscription.contract_id}
          setNotification={jest.fn()}
          setShowingCancel={jest.fn()}
        />
      </QueryClientProvider>
    );
    expect(wrapper.find("Button[data-test='cancel-button']").exists()).toBe(
      true
    );
  });

  it("does not show a cancel link if the subscription is not cancellable", () => {
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
          selectedId={subscription.contract_id}
          setNotification={jest.fn()}
          setShowingCancel={jest.fn()}
        />
      </QueryClientProvider>
    );
    expect(wrapper.find("Button[data-test='cancel-button']").exists()).toBe(
      false
    );
  });

  it("initially hides the cancel modal", () => {
    const wrapper = mount(
      <QueryClientProvider client={queryClient}>
        <SubscriptionEdit
          onClose={jest.fn()}
          selectedId={subscription.contract_id}
          setNotification={jest.fn()}
          setShowingCancel={jest.fn()}
        />
      </QueryClientProvider>
    );
    expect(wrapper.find("SubscriptionCancel").exists()).toBe(false);
  });

  it("can show the cancel modal", async () => {
    const setShowingCancel = jest.fn();
    const wrapper = mount(
      <QueryClientProvider client={queryClient}>
        <SubscriptionEdit
          onClose={jest.fn()}
          selectedId={subscription.contract_id}
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
});
