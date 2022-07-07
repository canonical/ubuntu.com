import {
  contractTokenFactory,
  lastPurchaseIdsFactory,
  userSubscriptionFactory,
  userSubscriptionEntitlementUpdateFactory,
} from "advantage/tests/factories/api";
import fetch from "jest-fetch-mock";

import {
  getContractToken,
  getLastPurchaseIds,
  getUserSubscriptions,
  putContractEntitlements,
} from "./contracts";

describe("contracts", () => {
  afterEach(() => {
    fetch.resetMocks();
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
      }
    );
  });
});
