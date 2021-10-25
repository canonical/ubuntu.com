import { UserSubscriptionPeriod } from "advantage/api/enum";
import { getPeriodDisplay } from "./getPeriodDisplay";

describe("getPeriodDisplay", () => {
  it("provides the labels for known values", () => {
    expect(getPeriodDisplay(UserSubscriptionPeriod.Monthly)).toBe("Monthly");
    expect(getPeriodDisplay(UserSubscriptionPeriod.Yearly)).toBe("Yearly");
  });
});
