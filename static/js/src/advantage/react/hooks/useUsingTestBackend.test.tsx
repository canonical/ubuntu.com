import React from "react";
import { renderHook, WrapperComponent } from "@testing-library/react-hooks";
import type { ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "react-query";
import { useUsingTestBackend } from "./useUsingTestBackend";

describe("useUsingTestBackend", () => {
  let queryClient: QueryClient;
  let wrapper: WrapperComponent<ReactNode>;

  beforeEach(() => {
    queryClient = new QueryClient();
    wrapper = ({ children }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
  });

  it("can return the pending purchase id from the store", async () => {
    queryClient.setQueryData("usingTestBackend", true);
    const { result, waitForNextUpdate } = renderHook(
      () => useUsingTestBackend(),
      { wrapper }
    );
    await waitForNextUpdate();
    expect(result.current.usingTestBackend).toBe(true);
  });
});
