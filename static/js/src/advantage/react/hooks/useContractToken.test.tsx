import React from "react";
import { renderHook } from "@testing-library/react-hooks";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useContractToken } from "./useContractToken";

import {
  contractTokenFactory,
  userSubscriptionFactory,
} from "advantage/tests/factories/api";

const createWrapper = (queryClient: QueryClient) => {
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe("useContractToken", () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient();
  });

  it("can get a contract token from the store", async () => {
    const contract = userSubscriptionFactory.build();
    const contractToken = contractTokenFactory.build();
    queryClient.setQueryData(
      ["contractToken", contract.contract_id],
      contractToken,
    );

    const wrapper = createWrapper(queryClient);
    const { result, waitForNextUpdate } = renderHook(
      () => useContractToken(contract.contract_id),
      {
        wrapper,
      },
    );
    await waitForNextUpdate();
    expect(result.current.data).toStrictEqual(contractToken);
  });
});
