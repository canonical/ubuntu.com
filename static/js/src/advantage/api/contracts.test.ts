import {
  contractTokenFactory,
  lastPurchaseIdsFactory,
  userInfoFactory,
  userSubscriptionFactory,
} from "advantage/tests/factories/api";
import fetch from "jest-fetch-mock";

import {
  getContractToken,
  getUserInfo,
  getLastPurchaseIds,
  getUserSubscriptions,
} from "./contracts";

describe("contracts", () => {
  afterEach(() => {
    fetch.resetMocks();
  });

  it("can get user info", async () => {
    const userInfoData = userInfoFactory.build();
    fetch.mockResponseOnce(JSON.stringify(userInfoData));
    await getUserInfo().then((response) => {
      expect(response).toStrictEqual(JSON.parse(JSON.stringify(userInfoData)));
    });
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
});
