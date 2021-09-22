import React, { PropsWithChildren } from "react";
import { renderHook, WrapperComponent } from "@testing-library/react-hooks";
import type { ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "react-query";
import { useUserInfo } from "./useUserInfo";

import { userInfoFactory } from "advantage/tests/factories/api";

describe("useUserInfo", () => {
  let queryClient: QueryClient;
  let wrapper: WrapperComponent<ReactNode>;

  beforeEach(() => {
    queryClient = new QueryClient();
    const Wrapper = ({ children }: PropsWithChildren<ReactNode>) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
    wrapper = Wrapper;
  });

  it("can return the user subscriptions from the store", async () => {
    const userInfo = userInfoFactory.build();
    queryClient.setQueryData("userInfo", userInfo);
    const { result, waitForNextUpdate } = renderHook(() => useUserInfo(), {
      wrapper,
    });
    await waitForNextUpdate();
    expect(result.current.data).toStrictEqual(userInfo);
  });
});
