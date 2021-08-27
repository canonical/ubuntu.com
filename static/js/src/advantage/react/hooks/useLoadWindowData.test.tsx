import React from "react";
import type { ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "react-query";
import { renderHook } from "@testing-library/react-hooks";

import { useLoadWindowData } from "./useLoadWindowData";
import { personalAccountFactory } from "../../tests/factories/api";
import { PersonalAccount } from "advantage/api/types";

describe("useLoadWindowData", () => {
  let personalAccount: PersonalAccount;

  beforeEach(() => {
    personalAccount = personalAccountFactory.build();
    window.pendingPurchaseId = "12345";
    window.personalAccount = personalAccount;
  });

  afterEach(() => {
    delete window.pendingPurchaseId;
    delete window.personalAccount;
  });

  it("fetches data from the window and inserts into react-query", async () => {
    const queryClient = new QueryClient();
    const wrapper = ({ children }: { children: ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
    renderHook(() => useLoadWindowData(queryClient), {
      wrapper,
    });
    expect(queryClient.getQueryData("pendingPurchaseId")).toBe("12345");
    expect(queryClient.getQueryData("personalAccount")).toStrictEqual(
      personalAccount
    );
  });
});
