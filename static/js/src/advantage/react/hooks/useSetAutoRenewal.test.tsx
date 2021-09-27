import React, { PropsWithChildren } from "react";
import { renderHook, WrapperComponent } from "@testing-library/react-hooks";
import type { ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "react-query";
import { useSetAutoRenewal } from "./useSetAutoRenewal";

import * as contracts from "advantage/api/contracts";
import { userInfoFactory } from "advantage/tests/factories/api";
import { UserInfo } from "advantage/api/types";

describe("useSetAutoRenewal", () => {
  let setAutoRenewalSpy: jest.SpyInstance;
  let queryClient: QueryClient;
  let wrapper: WrapperComponent<ReactNode>;
  let userInfo: UserInfo;

  beforeEach(() => {
    setAutoRenewalSpy = jest.spyOn(contracts, "setAutoRenewal");
    setAutoRenewalSpy.mockImplementation(() => Promise.resolve({}));
    queryClient = new QueryClient();
    userInfo = userInfoFactory.build();
    queryClient.setQueryData("userInfo", userInfo);
    const Wrapper = ({ children }: PropsWithChildren<ReactNode>) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
    wrapper = Wrapper;
  });

  it("can make the request to update the setting", async () => {
    const { result, waitForNextUpdate } = renderHook(
      () => useSetAutoRenewal(),
      { wrapper }
    );
    result.current.mutate(true);
    await waitForNextUpdate();
    expect(setAutoRenewalSpy).toHaveBeenCalledWith(true);
  });

  it("handles errors", async () => {
    setAutoRenewalSpy.mockImplementation(() =>
      Promise.resolve({
        errors: "Uh oh",
      })
    );
    const onError = jest.fn();
    const { result, waitForNextUpdate } = renderHook(
      () => useSetAutoRenewal(),
      { wrapper }
    );
    result.current.mutate(true, {
      onError: (error) => onError(error.message),
    });
    await waitForNextUpdate();
    expect(onError).toHaveBeenCalledWith("Uh oh");
  });

  it("invalidates queries when successful", async () => {
    const { result, waitForNextUpdate } = renderHook(
      () => useSetAutoRenewal(),
      { wrapper }
    );
    let userInfoState = queryClient.getQueryState("userInfo");
    expect(userInfoState?.isInvalidated).toBe(false);
    result.current.mutate(true);
    await waitForNextUpdate();
    userInfoState = queryClient.getQueryState("userInfo");
    expect(userInfoState?.isInvalidated).toBe(true);
  });
});
