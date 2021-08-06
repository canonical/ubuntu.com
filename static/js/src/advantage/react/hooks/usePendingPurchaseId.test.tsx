import React, { PropsWithChildren } from "react";
import { renderHook, WrapperComponent } from "@testing-library/react-hooks";
import type { ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "react-query";
import { usePendingPurchaseId } from "./usePendingPurchaseId";

describe("usePendingPurchaseId", () => {
  let queryClient: QueryClient;
  let wrapper: WrapperComponent<ReactNode>;

  beforeEach(() => {
    queryClient = new QueryClient();
    const Wrapper = ({ children }: PropsWithChildren<ReactNode>) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
    wrapper = Wrapper;
  });

  it("can return the pending purchase id from the store", async () => {
    queryClient.setQueryData("pendingPurchaseId", "abc123");
    const { result, waitForNextUpdate } = renderHook(
      () => usePendingPurchaseId(),
      { wrapper }
    );
    await waitForNextUpdate();
    expect(result.current.pendingPurchaseId).toBe("abc123");
  });
});
