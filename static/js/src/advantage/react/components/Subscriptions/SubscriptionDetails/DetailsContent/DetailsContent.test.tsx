import React from "react";
import { QueryClient, QueryClientProvider } from "react-query";
import { mount } from "enzyme";
import {
  UserSubscriptionMarketplace,
  UserSubscriptionPeriod,
} from "advantage/api/enum";
import {
  contractTokenFactory,
  freeSubscriptionFactory,
  userSubscriptionFactory,
  userSubscriptionStatusesFactory,
} from "advantage/tests/factories/api";
import DetailsContent from "./DetailsContent";

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
    expect(wrapper.find(".p-code-snippet").exists()).toBe(true);
    expect(wrapper.find("pre.p-code-snippet__block--icon").text()).toBe(
      contractToken.contract_token
    );
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
