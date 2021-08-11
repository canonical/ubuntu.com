import React, { PropsWithChildren } from "react";
import { renderHook, WrapperComponent } from "@testing-library/react-hooks";
import type { ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "react-query";

import * as useURLsModule from "./useURLs";

describe("useURLs", () => {
  let getURLsSpy: jest.SpyInstance;
  let queryClient: QueryClient;
  let wrapper: WrapperComponent<ReactNode>;

  beforeEach(() => {
    jest.resetModules();
    getURLsSpy = jest.spyOn(useURLsModule, "getURLs");
    queryClient = new QueryClient();
    const Wrapper = ({ children }: PropsWithChildren<ReactNode>) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
    wrapper = Wrapper;
  });

  afterAll(() => {
    jest.restoreAllMocks();
  });

  it("can return the URLs without modification", async () => {
    queryClient.setQueryData("usingTestBackend", false);
    const { result, waitForNextUpdate } = renderHook(
      () => useURLsModule.useURLs(),
      { wrapper }
    );
    await waitForNextUpdate();
    expect(result.current).toStrictEqual(useURLsModule.APP_URLS);
  });

  it("can return the URLs with the test backend flag", async () => {
    queryClient.setQueryData("usingTestBackend", true);
    const { result, waitForNextUpdate } = renderHook(
      () => useURLsModule.useURLs(),
      { wrapper }
    );
    await waitForNextUpdate();
    expect(result.current.account.paymentMethods).toBe(
      "/account/payment-methods?test_backend=true"
    );
  });

  it("can append to a URL with existing query params", async () => {
    queryClient.setQueryData("usingTestBackend", true);
    const urls = {
      ...useURLsModule.APP_URLS,
    };
    urls.account.paymentMethods = "/?existing=true";
    getURLsSpy.mockReturnValue(urls);
    const { result, waitForNextUpdate } = renderHook(
      () => useURLsModule.useURLs(),
      { wrapper }
    );
    await waitForNextUpdate();
    expect(result.current.account.paymentMethods).toBe(
      "/?existing=true&test_backend=true"
    );
  });

  it("does not append the test backend flag if it already exists", async () => {
    queryClient.setQueryData("usingTestBackend", true);
    const urls = {
      ...useURLsModule.APP_URLS,
    };
    urls.account.paymentMethods = "/?test_backend=true";
    const { result, waitForNextUpdate } = renderHook(
      () => useURLsModule.useURLs(),
      { wrapper }
    );
    await waitForNextUpdate();
    expect(result.current.account.paymentMethods).toBe("/?test_backend=true");
  });
});
