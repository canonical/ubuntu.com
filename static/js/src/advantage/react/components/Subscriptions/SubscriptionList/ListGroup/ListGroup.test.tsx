import React from "react";
import { mount } from "enzyme";
import { QueryClient, QueryClientProvider } from "react-query";
import {
  userSubscriptionFactory,
  userSubscriptionStatusesFactory,
} from "advantage/tests/factories/api";

import { UserSubscriptionMarketplace } from "advantage/api/enum";
import ListGroup from "./ListGroup";

describe("ListGroup", () => {
  let queryClient: QueryClient;

  beforeEach(async () => {
    queryClient = new QueryClient();
  });

  it("does not display the renewal settings when it should not", () => {
    const subscriptions = [
      userSubscriptionFactory.build({
        marketplace: UserSubscriptionMarketplace.CanonicalUA,
        statuses: userSubscriptionStatusesFactory.build({
          should_present_auto_renewal: false,
        }),
      }),
    ];
    queryClient.setQueryData("userSubscriptions", subscriptions);
    const wrapper = mount(
      <QueryClientProvider client={queryClient}>
        <ListGroup
          title="free personal token"
          marketplace={UserSubscriptionMarketplace.CanonicalUA}
        >
          Group content
        </ListGroup>
      </QueryClientProvider>
    );
    expect(wrapper.find("RenewalSettings").exists()).toBe(false);
  });

  it("can display the renewal settings", () => {
    const subscriptions = [
      userSubscriptionFactory.build({
        marketplace: UserSubscriptionMarketplace.CanonicalUA,
        statuses: userSubscriptionStatusesFactory.build({
          should_present_auto_renewal: true,
        }),
      }),
    ];
    queryClient.setQueryData("userSubscriptions", subscriptions);
    const wrapper = mount(
      <QueryClientProvider client={queryClient}>
        <ListGroup
          title="free personal token"
          marketplace={UserSubscriptionMarketplace.CanonicalUA}
        >
          Group content
        </ListGroup>
      </QueryClientProvider>
    );
    expect(wrapper.find("RenewalSettings").exists()).toBe(true);
  });
});
