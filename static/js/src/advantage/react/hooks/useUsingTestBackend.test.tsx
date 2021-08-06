import React, { PropsWithChildren } from "react";
import { renderHook, WrapperComponent } from "@testing-library/react-hooks";
import type { ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "react-query";
import { useUsingTestBackend } from "./useUsingTestBackend";

describe("useUsingTestBackend", () => {
  let queryClient: QueryClient;
  let wrapper: WrapperComponent<ReactNode>;

  beforeEach(() => {
    queryClient = new QueryClient();
    const Wrapper = ({ children }: PropsWithChildren<ReactNode>) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
    wrapper = Wrapper;
  });

  it("can return the test backend flag from the store", async () => {
    queryClient.setQueryData("usingTestBackend", true);
    const { result, waitForNextUpdate } = renderHook(
      () => useUsingTestBackend(),
      { wrapper }
    );
    await waitForNextUpdate();
    expect(result.current.usingTestBackend).toBe(true);
  });
});
