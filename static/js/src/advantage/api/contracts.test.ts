import {
  contractTokenFactory,
  lastPurchaseIdsFactory,
  userSubscriptionFactory,
  userSubscriptionEntitlementUpdateFactory,
} from "advantage/tests/factories/api";
import fetch from "jest-fetch-mock";

import {
  getContractToken,
  getInvoices,
  getLastPurchaseIds,
  getUserSubscriptions,
  putContractEntitlements,
} from "./contracts";

describe("contracts", () => {
  afterEach(() => {
    fetch.resetMocks();
  });

  it("fetches invoices with marketplace and pagination parameters", async () => {
    const invoices = {
      accountId: "account-1",
      invoices: [],
      marketplace: "blender",
      currentPage: 2,
      totalPages: 3,
    };
    fetch.mockResponseOnce(JSON.stringify(invoices));

    await expect(getInvoices("?marketplace=blender&page=2")).resolves.toEqual(
      invoices,
    );
    expect(fetch).toHaveBeenCalledWith(
      "/account/invoices.json?marketplace=blender&page=2",
      { cache: "no-store", headers: { Accept: "application/json" } },
    );
  });

  it("rejects unsuccessful invoice responses", async () => {
    fetch.mockResponseOnce(JSON.stringify({ error: "access forbidden" }), {
      status: 403,
    });

    await expect(getInvoices("")).rejects.toThrow("Unable to load invoices");
  });

  it("can get user subscriptions", async () => {
    const contractData = { data: userSubscriptionFactory.buildList(2) };
    fetch.mockResponseOnce(JSON.stringify(contractData));
    await getUserSubscriptions().then((response) => {
      expect(response).toStrictEqual(JSON.parse(JSON.stringify(contractData)));
    });
  });

  it("can get contract tokens", async () => {
    const contractToken = { data: contractTokenFactory.build() };
    fetch.mockResponseOnce(JSON.stringify(contractToken));
    await getContractToken().then((response) => {
      expect(response).toStrictEqual(contractToken);
    });
  });

  it("can get last purchase ids", async () => {
    const lastPurchaseIds = { data: lastPurchaseIdsFactory.build() };
    fetch.mockResponseOnce(JSON.stringify(lastPurchaseIds));
    await getLastPurchaseIds().then((response) => {
      expect(response).toStrictEqual(lastPurchaseIds);
    });
  });

  it("updates contract entitlements", async () => {
    const { contract_id } = userSubscriptionFactory.build();
    const entitlement = userSubscriptionEntitlementUpdateFactory.build();
    fetch.mockResponseOnce(JSON.stringify({}));
    await putContractEntitlements(contract_id, [entitlement]).then(
      (response) => {
        expect(response).toStrictEqual({});
      },
    );
  });
});
