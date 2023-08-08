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
          number_of_machines: 2,
          current_number_of_machines: 1,
          period: UserSubscriptionPeriod.Yearly,
        })
      )
    ).toBe("$10 USD/yr");
  });

  it("handles monthly prices", () => {
    expect(
      getSubscriptionCost(
        userSubscriptionFactory.build({
          currency: "USD",
          price: 2000,
          number_of_machines: 2,
          current_number_of_machines: 1,
          period: UserSubscriptionPeriod.Monthly,
        })
      )
    ).toBe("$120 USD/yr");
  });
});
