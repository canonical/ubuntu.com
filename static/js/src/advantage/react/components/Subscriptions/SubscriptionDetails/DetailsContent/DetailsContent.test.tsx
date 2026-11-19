import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
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
import { act } from "react";

describe("DetailsContent", () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient();
  });

  it("displays free token specific details", () => {
    const contract = freeSubscriptionFactory.build();
    queryClient.setQueryData(["userSubscriptions"], [contract]);
    const wrapper = mount(
      <QueryClientProvider client={queryClient}>
        <DetailsContent
          selectedId={contract.id}
          setHasUnsavedChanges={jest.fn()}
        />
      </QueryClientProvider>,
    );
    expect(wrapper.find("[data-test='billing-col']").text()).toBe("None");
  });

  it("displays ua subscription specific details", () => {
    const contract = userSubscriptionFactory.build({
      end_date: "2022-07-09T07:21:21Z",
      number_of_machines: 2,
      period: UserSubscriptionPeriod.Yearly,
      price: 150000,
    });
    queryClient.setQueryData(["userSubscriptions"], [contract]);
    const wrapper = mount(
      <QueryClientProvider client={queryClient}>
        <DetailsContent
          selectedId={contract.id}
          setHasUnsavedChanges={jest.fn()}
        />
      </QueryClientProvider>,
    );
    expect(wrapper.find("[data-test='billing-col']").text()).toBe("Yearly");
  });

  it("displays a spinner while loading the contract token", () => {
    const contract = userSubscriptionFactory.build();
    queryClient.setQueryData(["userSubscriptions"], [contract]);
    const wrapper = mount(
      <QueryClientProvider client={queryClient}>
        <DetailsContent
          selectedId={contract.id}
          setHasUnsavedChanges={jest.fn()}
        />
      </QueryClientProvider>,
    );
    expect(wrapper.find("[data-test='token-spinner'] Spinner").exists()).toBe(
      true,
    );
  });

  it("displays no contract token for billing users", () => {
    const contract = userSubscriptionFactory.build({
      statuses: userSubscriptionStatusesFactory.build({
        has_access_to_token: false,
      }),
    });

    queryClient.setQueryData(["userSubscriptions"], [contract]);
    const wrapper = mount(
      <QueryClientProvider client={queryClient}>
        <DetailsContent
          selectedId={contract.id}
          setHasUnsavedChanges={jest.fn()}
        />
      </QueryClientProvider>,
    );
    expect(wrapper.find("[data-test='token-spinner'] Spinner").exists()).toBe(
      false,
    );
  });

  it("shows the token without asking to accept terms once accepted", () => {
    const contract = userSubscriptionFactory.build();
    const contractToken = contractTokenFactory.build();
    queryClient.setQueryData(["userSubscriptions"], [contract]);
    queryClient.setQueryData(
      ["contractToken", contract.contract_id],
      contractToken,
    );
    queryClient.setQueryData(["accountTOS", contract.account_id], {
      accepted: true,
      accepted_at: "2026-11-19T10:00:00Z",
      email: "user@example.com",
    });
    render(
      <QueryClientProvider client={queryClient}>
        <DetailsContent
          selectedId={contract.id}
          setHasUnsavedChanges={jest.fn()}
        />
      </QueryClientProvider>,
    );
    expect(
      screen.queryByRole("dialog", { name: "Accept terms" }),
    ).not.toBeInTheDocument();
    expect(screen.getByText(contractToken.contract_token)).toBeInTheDocument();
  });

  it("asks to accept the terms and hides the token until accepted", () => {
    const contract = userSubscriptionFactory.build();
    const contractToken = contractTokenFactory.build();
    queryClient.setQueryData(["userSubscriptions"], [contract]);
    queryClient.setQueryData(
      ["contractToken", contract.contract_id],
      contractToken,
    );
    queryClient.setQueryData(["accountTOS", contract.account_id], {
      accepted: false,
      accepted_at: null,
      email: null,
    });
    render(
      <QueryClientProvider client={queryClient}>
        <DetailsContent
          selectedId={contract.id}
          setHasUnsavedChanges={jest.fn()}
        />
      </QueryClientProvider>,
    );
    expect(
      screen.getByRole("dialog", { name: "Accept terms" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Review and accept" }),
    ).toBeInTheDocument();
    expect(
      screen.queryByText(contractToken.contract_token),
    ).not.toBeInTheDocument();
  });

  it("can display the token copied notification", async () => {
    const contract = userSubscriptionFactory.build();
    const contractToken = contractTokenFactory.build();
    queryClient.setQueryData(["userSubscriptions"], [contract]);
    queryClient.setQueryData(
      ["contractToken", contract.contract_id],
      contractToken,
    );
    const wrapper = mount(
      <QueryClientProvider client={queryClient}>
        <DetailsContent
          selectedId={contract.id}
          setHasUnsavedChanges={jest.fn()}
        />
      </QueryClientProvider>,
    );

    act(() => {
      wrapper.find("[data-test='contract-token']").simulate("click");
    });
    wrapper.update();

    expect(wrapper.find("[data-test='token-copy-notification']").exists()).toBe(
      !!navigator.clipboard,
    );
  });

  it("displays correctly for blender subscription", () => {
    const contract = userSubscriptionFactory.build({
      marketplace: UserSubscriptionMarketplace.Blender,
    });
    queryClient.setQueryData(["userSubscriptions"], [contract]);
    const wrapper = mount(
      <QueryClientProvider client={queryClient}>
        <DetailsContent
          selectedId={contract.id}
          setHasUnsavedChanges={jest.fn()}
        />
      </QueryClientProvider>,
    );
    expect(wrapper.find("[data-test='machine-type-col']").exists()).toBe(false);
    expect(wrapper.find("CodeSnippet").exists()).toBe(false);
  });
});
