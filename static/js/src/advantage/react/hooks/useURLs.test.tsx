import React from "react";
import { renderHook } from "@testing-library/react-hooks";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import * as useURLsModule from "./useURLs";

const createWrapper = (queryClient: QueryClient) => {
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe("useURLs", () => {
  let queryClient: QueryClient;
  let initialLocation: Location;

  beforeAll(() => {
    initialLocation = window.location;
  });

  beforeEach(() => {
    jest.resetModules();
    queryClient = new QueryClient();
  });

  afterEach(() => {
    window.location = initialLocation;
  });

  afterAll(() => {
    jest.restoreAllMocks();
  });

  it("can return the URLs without modification", () => {
    const wrapper = createWrapper(queryClient);
    const { result } = renderHook(() => useURLsModule.useURLs(), { wrapper });
    expect(result.current).toStrictEqual(useURLsModule.APP_URLS);
  });
});
