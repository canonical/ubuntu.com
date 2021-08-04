import { renderHook } from "@testing-library/react-hooks";

import * as useURLsModule from "./useURLs";

describe("useURLs", () => {
  let getURLsSpy: jest.SpyInstance;

  beforeEach(() => {
    jest.resetModules();
    getURLsSpy = jest.spyOn(useURLsModule, "getURLs");
  });

  afterAll(() => {
    jest.restoreAllMocks();
  });

  it("can return the URLs without modification", async () => {
    const { result } = renderHook(() => useURLsModule.useURLs());
    expect(result.current).toStrictEqual(useURLsModule.APP_URLS);
  });

  it("can return the URLs with the test backend flag", async () => {
    const { result } = renderHook(() => useURLsModule.useURLs(true));
    expect(result.current.account.paymentMethods).toBe(
      "/account/payment-methods?test_backend=true"
    );
  });

  it("can append to a URL with existing query params", async () => {
    const urls = {
      ...useURLsModule.APP_URLS,
    };
    urls.account.paymentMethods = "/?existing=true";
    getURLsSpy.mockReturnValue(urls);
    const { result } = renderHook(() => useURLsModule.useURLs(true));
    expect(result.current.account.paymentMethods).toBe(
      "/?existing=true&test_backend=true"
    );
  });
});
