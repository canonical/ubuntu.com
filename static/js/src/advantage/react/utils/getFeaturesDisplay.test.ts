import { EntitlementType, SupportLevel } from "advantage/api/enum";
import {
  affordancesSupportFactory,
  contractInfoFactory,
  entitlementFactory,
  entitlementSupportFactory,
} from "advantage/tests/factories/contracts";
import { getFeaturesDisplay } from "./getFeaturesDisplay";

describe("getFeaturesDisplay", () => {
  it("generates display labels for features", () => {
    const contractInfo = contractInfoFactory.build({
      resourceEntitlements: [
        entitlementFactory.build({ type: EntitlementType.LIVEPATCH }),
        entitlementSupportFactory.build({
          affordances: affordancesSupportFactory.build({
            supportLevel: SupportLevel.ADVANCED,
          }),
        }),
      ],
    });
    expect(getFeaturesDisplay(contractInfo)).toStrictEqual({
      excluded: ["Blender", "ESM Apps", "ESM Infra"],
      included: ["Livepatch", "24/7 Support"],
    });
  });

  it("dedupes livepatch labels", () => {
    const contractInfo = contractInfoFactory.build({
      resourceEntitlements: [
        entitlementFactory.build({ type: EntitlementType.LIVEPATCH }),
        entitlementFactory.build({ type: EntitlementType.LIVEPATCH_ONPREM }),
      ],
    });
    expect(getFeaturesDisplay(contractInfo).included).toStrictEqual([
      "Livepatch",
    ]);
  });

  it("ignores some labels", () => {
    const contractInfo = contractInfoFactory.build({
      resourceEntitlements: [
        entitlementFactory.build({ type: EntitlementType.CC_EAL }),
        entitlementFactory.build({ type: EntitlementType.CIS }),
        entitlementFactory.build({ type: EntitlementType.FIPS_UPDATES }),
        entitlementFactory.build({ type: EntitlementType.FIPS }),
      ],
    });
    expect(getFeaturesDisplay(contractInfo).included).toStrictEqual([]);
  });

  it("handles advanced support label", () => {
    const contractInfo = contractInfoFactory.build({
      resourceEntitlements: [
        entitlementSupportFactory.build({
          affordances: affordancesSupportFactory.build({
            supportLevel: SupportLevel.ADVANCED,
          }),
        }),
      ],
    });
    expect(getFeaturesDisplay(contractInfo).included).toStrictEqual([
      "24/7 Support",
    ]);
  });

  it("handles standard support label", () => {
    const contractInfo = contractInfoFactory.build({
      resourceEntitlements: [
        entitlementSupportFactory.build({
          affordances: affordancesSupportFactory.build({
            supportLevel: SupportLevel.STANDARD,
          }),
        }),
      ],
    });
    expect(getFeaturesDisplay(contractInfo).included).toStrictEqual([
      "24/5 Support",
    ]);
  });

  it("handles excluded support labels", () => {
    const contractInfo = contractInfoFactory.build({
      resourceEntitlements: [],
    });
    expect(getFeaturesDisplay(contractInfo).excluded.includes("Support")).toBe(
      true
    );
  });

  it("does not show excluded support label if a support affordance exists", () => {
    const contractInfo = contractInfoFactory.build({
      resourceEntitlements: [
        entitlementSupportFactory.build({
          affordances: affordancesSupportFactory.build({
            supportLevel: SupportLevel.STANDARD,
          }),
        }),
      ],
    });
    expect(getFeaturesDisplay(contractInfo).excluded.includes("Support")).toBe(
      false
    );
  });
});
