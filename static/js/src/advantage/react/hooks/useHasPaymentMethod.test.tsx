import React from "react";
import { renderHook } from "@testing-library/react-hooks";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useHasPaymentMethod } from "./useHasPaymentMethod";

const createWrapper = (queryClient: QueryClient) => {
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe("useHasPaymentMethod", () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient();
  });

  it("can get whether the user has a payment method", async () => {
    queryClient.setQueryData(
      ["accountId", "123"],
      true,
    );

    const wrapper = createWrapper(queryClient);
    const { result, waitForNextUpdate } = renderHook(
      () => useHasPaymentMethod("123"),
      {
        wrapper,
      },
    );
    await waitForNextUpdate();
    expect(result.current.data).toStrictEqual(true);
  });
});
