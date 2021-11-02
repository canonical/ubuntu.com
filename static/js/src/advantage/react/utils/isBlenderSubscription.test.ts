import { UserSubscriptionMarketplace } from "advantage/api/enum";
import { userSubscriptionFactory } from "advantage/tests/factories/api";
import { isBlenderSubscription } from "./isBlenderSubscription";

describe("isBlenderSubscription", () => {
  it("can identify blender subscriptions", () => {
    expect(
      isBlenderSubscription(
        userSubscriptionFactory.build({
          marketplace: UserSubscriptionMarketplace.Blender,
        })
      )
    ).toBe(true);
  });

  it("can identify non-blender subscriptions", () => {
    expect(
      isBlenderSubscription(
        userSubscriptionFactory.build({
          marketplace: UserSubscriptionMarketplace.CanonicalUA,
        })
      )
    ).toBe(false);
  });
});
