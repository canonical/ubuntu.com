import fetch from "jest-fetch-mock";

import { getUserSubscriptions } from "./contracts";

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
});
