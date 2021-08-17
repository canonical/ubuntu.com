import React from "react";
import { mount } from "enzyme";
import { QueryClient, QueryClientProvider } from "react-query";

import SubscriptionList from "./SubscriptionList";
import {
  contractWithTokenFactory,
  personalAccountFactory,
} from "advantage/tests/factories/api";
import {
  contractInfoFactory,
  contractItemFactory,
  entitlementSupportFactory,
} from "advantage/tests/factories/contracts";

describe("SubscriptionList", () => {
  it("displays a free token", () => {
    const personalAccount = personalAccountFactory.build({
      contracts: [
        contractWithTokenFactory.build({
          contractInfo: contractInfoFactory.build({
            items: [
              contractItemFactory.build({
                metric: "units",
                value: 2,
              }),
            ],
            resourceEntitlements: [entitlementSupportFactory.build()],
          }),
          token: "free-token",
        }),
      ],
      free_token: "free-token",
    });
    const queryClient = new QueryClient();
    queryClient.setQueryData("personalAccount", personalAccount);
    const wrapper = mount(
      <QueryClientProvider client={queryClient}>
        <SubscriptionList setSelectedToken={jest.fn()} />
      </QueryClientProvider>
    );
    const token = wrapper.find("[data-test='free-token']");
    expect(token.exists()).toBe(true);
    expect(token.prop("created")).toBe(personalAccount.createdAt);
    expect(token.prop("expires")).toBe(null);
    expect(token.prop("features")).toStrictEqual(["24/5 Support"]);
    expect(token.prop("machines")).toBe(2);
  });

  it("can display the free token as selected", () => {
    const personalAccount = personalAccountFactory.build({
      contracts: [
        contractWithTokenFactory.build({
          token: "free-token",
        }),
      ],
      free_token: "free-token",
    });
    const queryClient = new QueryClient();
    queryClient.setQueryData("personalAccount", personalAccount);
    const wrapper = mount(
      <QueryClientProvider client={queryClient}>
        <SubscriptionList
          selectedToken="free-token"
          setSelectedToken={jest.fn()}
        />
      </QueryClientProvider>
    );
    expect(wrapper.find("[data-test='free-token']").prop("isSelected")).toBe(
      true
    );
  });
});
