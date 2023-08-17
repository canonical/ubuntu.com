import React from "react";
import { mount } from "enzyme";
import { QueryClient, QueryClientProvider } from "react-query";

import DetailsContent from "./DetailsContent";
import {
  contractTokenFactory,
  freeSubscriptionFactory,
  userSubscriptionFactory,
  userSubscriptionStatusesFactory,
} from "advantage/tests/factories/api";
import {
  UserSubscriptionPeriod,
  UserSubscriptionMarketplace,
} from "advantage/api/enum";
import { CodeSnippet } from "@canonical/react-components";

describe("DetailsContent", () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient();
  });

  it("displays free token specific details", () => {
    const contract = freeSubscriptionFactory.build();
    queryClient.setQueryData("userSubscriptions", [contract]);
    const wrapper = mount(
      <QueryClientProvider client={queryClient}>
        <DetailsContent
          selectedId={contract.id}
          setHasUnsavedChanges={jest.fn()}
        />
      </QueryClientProvider>
    );
    expect(wrapper.find("[data-test='billing-col']").text()).toBe("None");
    expect(wrapper.find("[data-test='cost-col']").text()).toBe("Free");
  });

  it("displays ua subscription specific details", () => {
    const contract = userSubscriptionFactory.build({
      end_date: new Date("2022-07-09T07:21:21Z"),
      number_of_machines: 2,
      period: UserSubscriptionPeriod.Yearly,
      price: 150000,
    });
    queryClient.setQueryData("userSubscriptions", [contract]);
    const wrapper = mount(
      <QueryClientProvider client={queryClient}>
        <DetailsContent
          selectedId={contract.id}
          setHasUnsavedChanges={jest.fn()}
        />
      </QueryClientProvider>
    );
    expect(wrapper.find("[data-test='billing-col']").text()).toBe("Yearly");
    expect(wrapper.find("[data-test='cost-col']").text()).toBe("$1,500 USD/yr");
  });

  it("displays a spinner while loading the contract token", () => {
    const contract = userSubscriptionFactory.build();
    queryClient.setQueryData("userSubscriptions", [contract]);
    const wrapper = mount(
      <QueryClientProvider client={queryClient}>
        <DetailsContent
          selectedId={contract.id}
          setHasUnsavedChanges={jest.fn()}
        />
      </QueryClientProvider>
    );
    expect(wrapper.find("[data-test='token-spinner'] Spinner").exists()).toBe(
      true
    );
  });

  it("displays no contract token for billing users", () => {
    const contract = userSubscriptionFactory.build({
      statuses: userSubscriptionStatusesFactory.build({
        has_access_to_token: false,
      }),
    });

    queryClient.setQueryData("userSubscriptions", [contract]);
    const wrapper = mount(
      <QueryClientProvider client={queryClient}>
        <DetailsContent
          selectedId={contract.id}
          setHasUnsavedChanges={jest.fn()}
        />
      </QueryClientProvider>
    );
    expect(wrapper.find("[data-test='token-spinner'] Spinner").exists()).toBe(
      false
    );
  });

  it("can display the contract token", () => {
    const contract = userSubscriptionFactory.build();
    const contractToken = contractTokenFactory.build();
    queryClient.setQueryData("userSubscriptions", [contract]);
    queryClient.setQueryData(
      ["contractToken", contract.contract_id],
      contractToken
    );
    const wrapper = mount(
      <QueryClientProvider client={queryClient}>
        <DetailsContent
          selectedId={contract.id}
          setHasUnsavedChanges={jest.fn()}
        />
      </QueryClientProvider>
    );
    expect(wrapper.find("CodeSnippet").exists()).toBe(true);
    expect(wrapper.find(CodeSnippet).prop("blocks")[0].code).toBe(
      contractToken.contract_token
    );
  });

  it("hides the cost column if there is no cost provided", () => {
    const contract = userSubscriptionFactory.build();
    contract.price = null;
    queryClient.setQueryData("userSubscriptions", [contract]);
    const wrapper = mount(
      <QueryClientProvider client={queryClient}>
        <DetailsContent
          selectedId={contract.id}
          setHasUnsavedChanges={jest.fn()}
        />
      </QueryClientProvider>
    );
    expect(wrapper.find("[data-test='cost-col']").exists()).toBe(false);
  });

  it("displays correctly for blender subscription", () => {
    const contract = userSubscriptionFactory.build({
      marketplace: UserSubscriptionMarketplace.Blender,
    });
    queryClient.setQueryData("userSubscriptions", [contract]);
    const wrapper = mount(
      <QueryClientProvider client={queryClient}>
        <DetailsContent
          selectedId={contract.id}
          setHasUnsavedChanges={jest.fn()}
        />
      </QueryClientProvider>
    );
    expect(wrapper.find("[data-test='machine-type-col']").exists()).toBe(false);
    expect(wrapper.find("CodeSnippet").exists()).toBe(false);
  });
});
