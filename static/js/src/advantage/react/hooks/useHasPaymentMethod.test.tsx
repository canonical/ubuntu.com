import React from "react";
import { renderHook } from "@testing-library/react-hooks";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useHasPaymentMethod } from "./useHasPaymentMethod";
import { getCustomerInfo } from "advantage/api/contracts";

jest.mock("advantage/api/contracts", () => ({
  getCustomerInfo: jest.fn(),
}));

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

  it("returns true if the user has a payment method", async () => {
    (getCustomerInfo as jest.Mock).mockResolvedValue({
      data: {
        customerInfo: {
          defaultPaymentMethod: {
            Id: "123",
          },
        },
      },
    });

    const wrapper = createWrapper(queryClient);
    const { result, waitForNextUpdate } = renderHook(
      () => useHasPaymentMethod("123"),
      {
        wrapper,
      },
    );
    await waitForNextUpdate();
    expect(result.current.data).toBe(true);
  });

  it("returns false if the user does not have a payment method", async () => {
    (getCustomerInfo as jest.Mock).mockResolvedValue({
      data: {
        customerInfo: {},
      },
    });

    const wrapper = createWrapper(queryClient);
    const { result, waitForNextUpdate } = renderHook(
      () => useHasPaymentMethod("123"),
      {
        wrapper,
      },
    );
    await waitForNextUpdate();
    expect(result.current.data).toBe(false);
  });
});
