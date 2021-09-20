import { UserSubscriptionPeriod } from "advantage/api/enum";
import {
  freeSubscriptionFactory,
  userSubscriptionFactory,
} from "advantage/tests/factories/api";
import { getSubscriptionCost } from "./getSubscriptionCost";

describe("getSubscriptionCost", () => {
  it("handles free subscriptions", () => {
    expect(getSubscriptionCost(freeSubscriptionFactory.build())).toBe("Free");
  });

  it("handles yearly prices", () => {
    expect(
      getSubscriptionCost(
        userSubscriptionFactory.build({
          currency: "USD",
          price: 2000,
          period: UserSubscriptionPeriod.Yearly,
        })
      )
    ).toBe("$20 USD/yr");
  });

  it("handles monthly prices", () => {
    expect(
      getSubscriptionCost(
        userSubscriptionFactory.build({
          currency: "USD",
          price: 2000,
          period: UserSubscriptionPeriod.Monthly,
        })
      )
    ).toBe("$240 USD/yr");
  });
});
