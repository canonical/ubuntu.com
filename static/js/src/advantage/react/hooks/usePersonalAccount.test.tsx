import React, { PropsWithChildren } from "react";
import { renderHook, WrapperComponent } from "@testing-library/react-hooks";
import type { ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "react-query";
import { usePersonalAccount } from "./usePersonalAccount";
import { personalAccountFactory } from "advantage/tests/factories/api";

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

  it("can return the pending purchase id from the store", async () => {
    const personalAccount = personalAccountFactory.build();
    queryClient.setQueryData("personalAccount", personalAccount);
    const { result, waitForNextUpdate } = renderHook(
      () => usePersonalAccount(),
      { wrapper }
    );
    await waitForNextUpdate();
    expect(result.current.personalAccount).toBe(personalAccount);
  });
});
