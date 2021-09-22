import React, { PropsWithChildren } from "react";
import { renderHook, WrapperComponent } from "@testing-library/react-hooks";
import type { ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "react-query";
import { useStripePublishableKey } from "./useStripePublishableKey";

describe("useStripePublishableKey", () => {
  let queryClient: QueryClient;
  let wrapper: WrapperComponent<ReactNode>;

  beforeEach(() => {
    queryClient = new QueryClient();
    const Wrapper = ({ children }: PropsWithChildren<ReactNode>) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
    wrapper = Wrapper;
  });

  it("can return the stripe publishable key from the store", async () => {
    queryClient.setQueryData("stripePublishableKey", "abc123");
    const { result, waitForNextUpdate } = renderHook(
      () => useStripePublishableKey(),
      { wrapper }
    );
    await waitForNextUpdate();
    expect(result.current.stripePublishableKey).toBe("abc123");
  });
});
