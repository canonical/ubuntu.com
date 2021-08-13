import React, { PropsWithChildren } from "react";
import { renderHook, WrapperComponent } from "@testing-library/react-hooks";
import type { ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "react-query";
import { selectFreeContract, usePersonalAccount } from "./usePersonalAccount";
import {
  contractWithTokenFactory,
  personalAccountFactory,
} from "advantage/tests/factories/api";
import {
  contractInfoFactory,
  entitlementSupportFactory,
} from "advantage/tests/factories/contracts";

describe("usePersonalAccount", () => {
  let queryClient: QueryClient;
  let wrapper: WrapperComponent<ReactNode>;

  beforeEach(() => {
    queryClient = new QueryClient();
    const Wrapper = ({ children }: PropsWithChildren<ReactNode>) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
    wrapper = Wrapper;
  });

  it("can return the personal account from the store", async () => {
    const personalAccount = personalAccountFactory.build();
    queryClient.setQueryData("personalAccount", personalAccount);
    const { result, waitForNextUpdate } = renderHook(
      () => usePersonalAccount(),
      { wrapper }
    );
    await waitForNextUpdate();
    expect(result.current.data).toStrictEqual(personalAccount);
  });

  it("can return the free account", async () => {
    const freeContract = contractWithTokenFactory.build({
      contractInfo: contractInfoFactory.build({
        resourceEntitlements: [entitlementSupportFactory.build()],
      }),
      token: "free-token",
    });
    const personalAccount = personalAccountFactory.build({
      contracts: [freeContract],
      free_token: "free-token",
    });
    queryClient.setQueryData("personalAccount", personalAccount);
    const { result, waitForNextUpdate } = renderHook(
      () => usePersonalAccount({ select: selectFreeContract }),
      { wrapper }
    );
    await waitForNextUpdate();
    expect(result.current.data).toStrictEqual(freeContract);
  });
});
