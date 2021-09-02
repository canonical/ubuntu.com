import { UserSubscriptionType } from "advantage/api/enum";
import { userSubscriptionFactory } from "advantage/tests/factories/api";
import { isFreeSubscription } from "./isFreeSubscription";

describe("isFreeSubscription", () => {
  it("can identify free subscriptions", () => {
    expect(
      isFreeSubscription(
        userSubscriptionFactory.build({ type: UserSubscriptionType.Free })
      )
    ).toBe(true);
  });

  it("can identify non-free subscriptions", () => {
    expect(
      isFreeSubscription(
        userSubscriptionFactory.build({ type: UserSubscriptionType.Trial })
      )
    ).toBe(false);
  });
});
