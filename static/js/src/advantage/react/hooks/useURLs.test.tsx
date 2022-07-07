import React, { PropsWithChildren } from "react";
import { renderHook, WrapperComponent } from "@testing-library/react-hooks";
import type { ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "react-query";

import * as useURLsModule from "./useURLs";

describe("useURLs", () => {
  let queryClient: QueryClient;
  let wrapper: WrapperComponent<ReactNode>;
  let initialLocation: Location;

  beforeAll(() => {
    initialLocation = window.location;
  });

  beforeEach(() => {
    jest.resetModules();
    queryClient = new QueryClient();
    const Wrapper = ({ children }: PropsWithChildren<ReactNode>) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
    wrapper = Wrapper;
  });

  afterEach(() => {
    window.location = initialLocation;
  });

  afterAll(() => {
    jest.restoreAllMocks();
  });

  it("can return the URLs without modification", () => {
    const { result } = renderHook(() => useURLsModule.useURLs(), { wrapper });
    expect(result.current).toStrictEqual(useURLsModule.APP_URLS);
  });
});
