import React from "react";
import type { ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "react-query";
import { renderHook } from "@testing-library/react-hooks";

import { useLoadWindowData } from "./useLoadWindowData";
import {
  enterpriseContractsFactory,
  personalAccountFactory,
} from "../../tests/factories/api";
import { EnterpriseContracts, PersonalAccount } from "advantage/api/types";

describe("useLoadWindowData", () => {
  let enterpriseContracts: EnterpriseContracts;
  let personalAccount: PersonalAccount;

  beforeEach(() => {
    enterpriseContracts = enterpriseContractsFactory.build();
    personalAccount = personalAccountFactory.build();
    window.enterpriseContracts = enterpriseContracts;
    window.pendingPurchaseId = "12345";
    window.personalAccount = personalAccount;
  });

  afterEach(() => {
    delete window.enterpriseContracts;
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
    expect(queryClient.getQueryData("enterpriseContracts")).toStrictEqual(
      enterpriseContracts
    );
    expect(queryClient.getQueryData("pendingPurchaseId")).toBe("12345");
    expect(queryClient.getQueryData("personalAccount")).toStrictEqual(
      personalAccount
    );
  });
});
