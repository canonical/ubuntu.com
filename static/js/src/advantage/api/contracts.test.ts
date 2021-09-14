import fetch from "jest-fetch-mock";

import { getContractToken, getUserSubscriptions } from "./contracts";

describe("contracts", () => {
  afterEach(() => {
    fetch.resetMocks();
  });

  it("can get user subscriptions", () => {
    const contractData = { data: { test: "contract" } };
    fetch.mockResponseOnce(JSON.stringify(contractData));
    getUserSubscriptions().then((response) => {
      expect(response).toStrictEqual(contractData);
    });
  });

  it("can get contract tokens", () => {
    const contractToken = { data: { contract_token: "abc123" } };
    fetch.mockResponseOnce(JSON.stringify(contractToken));
    getContractToken().then((response) => {
      expect(response).toStrictEqual(contractToken);
    });
  });
});
