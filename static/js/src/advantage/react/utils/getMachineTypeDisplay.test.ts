import { UserSubscriptionMachineType } from "advantage/api/enum";
import { getMachineTypeDisplay } from "./getMachineTypeDisplay";

describe("getMachineTypeDisplay", () => {
  it("provides the labels for known values", () => {
    expect(getMachineTypeDisplay(UserSubscriptionMachineType.Virtual)).toBe(
      "Virtual"
    );
    expect(getMachineTypeDisplay(UserSubscriptionMachineType.Physical)).toBe(
      "Physical"
    );
    expect(getMachineTypeDisplay(UserSubscriptionMachineType.Desktop)).toBe(
      "Desktop"
    );
  });
});
