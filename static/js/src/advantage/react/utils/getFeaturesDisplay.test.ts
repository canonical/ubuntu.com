import { EntitlementType, SupportLevel } from "advantage/api/enum";
import { userSubscriptionEntitlementFactory } from "advantage/tests/factories/api";
import { getFeaturesDisplay } from "./getFeaturesDisplay";

describe("getFeaturesDisplay", () => {
  it("generates display labels for features", () => {
    const entitlements = [
      userSubscriptionEntitlementFactory.build({
        type: EntitlementType.Livepatch,
      }),
      userSubscriptionEntitlementFactory.build({
        support_level: SupportLevel.Advanced,
        type: EntitlementType.Support,
      }),
      userSubscriptionEntitlementFactory.build({
        enabled_by_default: false,
        type: EntitlementType.Blender,
      }),
      userSubscriptionEntitlementFactory.build({
        enabled_by_default: false,
        type: EntitlementType.EsmApps,
      }),
      userSubscriptionEntitlementFactory.build({
        enabled_by_default: false,
        type: EntitlementType.EsmInfra,
      }),
    ];
    expect(getFeaturesDisplay(entitlements)).toStrictEqual({
      excluded: ["Blender", "ESM Apps", "ESM Infra"],
      included: ["Livepatch", "24/7 Support"],
    });
  });

  it("dedupes livepatch labels", () => {
    const entitlements = [
      userSubscriptionEntitlementFactory.build({
        type: EntitlementType.Livepatch,
      }),
      userSubscriptionEntitlementFactory.build({
        type: EntitlementType.LivepatchOnprem,
      }),
    ];
    expect(getFeaturesDisplay(entitlements).included).toStrictEqual([
      "Livepatch",
    ]);
  });

  it("ignores some labels", () => {
    const entitlements = [
      userSubscriptionEntitlementFactory.build({ type: EntitlementType.CcEal }),
      userSubscriptionEntitlementFactory.build({ type: EntitlementType.Cis }),
      userSubscriptionEntitlementFactory.build({
        type: EntitlementType.FipsUpdates,
      }),
      userSubscriptionEntitlementFactory.build({ type: EntitlementType.Fips }),
    ];
    expect(getFeaturesDisplay(entitlements).included).toStrictEqual([]);
  });

  it("handles advanced support label", () => {
    const entitlements = [
      userSubscriptionEntitlementFactory.build({
        support_level: SupportLevel.Advanced,
        type: EntitlementType.Support,
      }),
    ];
    expect(getFeaturesDisplay(entitlements).included).toStrictEqual([
      "24/7 Support",
    ]);
  });

  it("handles standard support label", () => {
    const entitlements = [
      userSubscriptionEntitlementFactory.build({
        support_level: SupportLevel.Standard,
        type: EntitlementType.Support,
      }),
    ];
    expect(getFeaturesDisplay(entitlements).included).toStrictEqual([
      "24/5 Support",
    ]);
  });

  it("handles excluded support labels", () => {
    const entitlements = [
      userSubscriptionEntitlementFactory.build({
        support_level: SupportLevel.Standard,
        type: EntitlementType.Support,
        enabled_by_default: false,
      }),
    ];
    expect(
      getFeaturesDisplay(entitlements).excluded.includes("24/5 Support")
    ).toBe(true);
  });
});
