import { getNextCycleStart } from "./getNextCycleStart";
import { userSubscriptionFactory } from "../../../advantage/tests/factories/api";

describe("getNextCycleStart", () => {
  it("returns the correct next cycle start date", () => {
    expect(
      getNextCycleStart(
        userSubscriptionFactory.build({ end_date: new Date("2020-06-16") })
      )
    ).toStrictEqual(new Date("2020-06-17"));
  });

  it("returns null if there is no end date", () => {
    expect(
      getNextCycleStart(userSubscriptionFactory.build({ end_date: null }))
    ).toBe(null);
  });
});
