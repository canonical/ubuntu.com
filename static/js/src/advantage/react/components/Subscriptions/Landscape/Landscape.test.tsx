import React from "react";
import { QueryClient, QueryClientProvider } from "react-query";
import { mount } from "enzyme";
import Landscape from "./Landscape";
import { Button } from "@canonical/react-components";

describe("Landscape", () => {
  let queryClient: QueryClient;
  beforeEach(() => {
    queryClient = new QueryClient();
  });

  it("renders correctly", () => {
    const wrapper = mount(
      <QueryClientProvider client={queryClient}>
        <Landscape />
      </QueryClientProvider>
    );
    expect(wrapper.find("[data-test='landscape']").exists()).toBe(true);
    expect(wrapper.find(Button).length).toBe(2);
    expect(wrapper.find(Button).at(0).text()).toBe(
      "Install self-hosted Landscape"
    );
    expect(wrapper.find(Button).at(1).text()).toBe(
      "Request a Landscape SaaS account"
    );
  });
});
