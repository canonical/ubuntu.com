import React, { PropsWithChildren } from "react";
import { renderHook, WrapperComponent } from "@testing-library/react-hooks";
import type { ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "react-query";
import { useContractToken } from "./useContractToken";

import {
  contractTokenFactory,
  userSubscriptionFactory,
} from "advantage/tests/factories/api";

describe("useContractToken", () => {
  let queryClient: QueryClient;
  let wrapper: WrapperComponent<ReactNode>;

  beforeEach(() => {
    queryClient = new QueryClient();
    const Wrapper = ({ children }: PropsWithChildren<ReactNode>) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
    wrapper = Wrapper;
  });

  it("can get a contract token from the store", async () => {
    const contract = userSubscriptionFactory.build();
    const contractToken = contractTokenFactory.build();
    queryClient.setQueryData(
      ["contractToken", contract.contract_id],
      contractToken
    );
    const { result, waitForNextUpdate } = renderHook(
      () => useContractToken(contract.contract_id),
      {
        wrapper,
      }
    );
    await waitForNextUpdate();
    expect(result.current.data).toStrictEqual(contractToken);
  });
});
