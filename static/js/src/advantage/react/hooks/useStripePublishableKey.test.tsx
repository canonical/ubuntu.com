import React from "react";
import { renderHook } from "@testing-library/react-hooks";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useStripePublishableKey } from "./useStripePublishableKey";

const createWrapper = (queryClient: QueryClient) => {
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
};

describe("useStripePublishableKey", () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient();
  });

  it("can return the stripe publishable key from the store", async () => {
    const wrapper = createWrapper(queryClient);
    queryClient.setQueryData(["stripePublishableKey"], "abc123");
    const { result, waitForNextUpdate } = renderHook(
      () => useStripePublishableKey(),
      { wrapper }
    );
    await waitForNextUpdate();
    expect(result.current.stripePublishableKey).toBe("abc123");
  });
});
