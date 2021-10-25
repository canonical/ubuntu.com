import { EntitlementType, SupportLevel } from "advantage/api/enum";
import { userSubscriptionEntitlementFactory } from "advantage/tests/factories/api";
import {
  EntitlementLabel,
  getEntitlementLabel,
  receiveEntitlements,
} from "./filterAndFormatEntitlements";

it("returns entitlements with labels as keys", () => {
  const entitlements = [
    userSubscriptionEntitlementFactory.build({
      enabled_by_default: false,
      is_available: true,
      is_editable: true,
      type: EntitlementType.EsmInfra,
    }),
    userSubscriptionEntitlementFactory.build({
      enabled_by_default: true,
      is_available: true,
      is_editable: true,
      type: EntitlementType.Livepatch,
    }),
    userSubscriptionEntitlementFactory.build({
      enabled_by_default: true,
      is_available: true,
      is_editable: false,
      support_level: SupportLevel.Advanced,
      type: EntitlementType.Support,
    }),
    userSubscriptionEntitlementFactory.build({
      enabled_by_default: false,
      is_available: false,
      is_editable: false,
      type: EntitlementType.EsmApps,
    }),
    userSubscriptionEntitlementFactory.build({
      enabled_by_default: false,
      is_available: false,
      is_editable: false,
      support_level: SupportLevel.Advanced,
      type: EntitlementType.Support,
    }),
  ];
  expect(receiveEntitlements(entitlements).byLabel).toEqual({
    "24/7 Support": {
      enabled_by_default: false,
      is_available: false,
      is_editable: false,
      support_level: "advanced",
      type: "support",
    },
    "ESM Infra": {
      enabled_by_default: false,
      is_available: true,
      is_editable: true,
      support_level: null,
      type: "esm-infra",
    },
    Livepatch: {
      enabled_by_default: true,
      is_available: true,
      is_editable: true,
      support_level: null,
      type: "livepatch",
    },
  });
});

it("removes duplicate livepatch labels", () => {
  const entitlements = [
    userSubscriptionEntitlementFactory.build({
      type: EntitlementType.Livepatch,
    }),
    userSubscriptionEntitlementFactory.build({
      type: EntitlementType.LivepatchOnprem,
    }),
  ];
  expect(receiveEntitlements(entitlements).included).toStrictEqual([
    "Livepatch",
  ]);
});

it("returns correct entitlement label", () => {
  const livepatch = userSubscriptionEntitlementFactory.build({
    type: EntitlementType.Livepatch,
  });
  const cis = userSubscriptionEntitlementFactory.build({
    type: EntitlementType.Cis,
  });

  expect(getEntitlementLabel(livepatch)).toEqual("Livepatch");
  expect(getEntitlementLabel(cis)).toEqual("CIS");
});

it("ignores some labels", () => {
  const entitlements = [
    userSubscriptionEntitlementFactory.build({ type: EntitlementType.CcEal }),
    userSubscriptionEntitlementFactory.build({ type: EntitlementType.EsmApps }),
    userSubscriptionEntitlementFactory.build({
      type: EntitlementType.EsmInfra,
    }),
  ];
  expect(receiveEntitlements(entitlements).included).toStrictEqual([
    EntitlementLabel.EsmInfra,
  ]);
  expect(receiveEntitlements(entitlements).excluded).toHaveLength(0);
  expect(receiveEntitlements(entitlements).alwaysAvailable).toHaveLength(0);
});

it("correctly groups always available features", () => {
  const entitlements = [
    userSubscriptionEntitlementFactory.build({ type: EntitlementType.Cis }),
    userSubscriptionEntitlementFactory.build({
      type: EntitlementType.FipsUpdates,
    }),
    userSubscriptionEntitlementFactory.build({ type: EntitlementType.Fips }),
  ];
  expect(receiveEntitlements(entitlements).included).toHaveLength(0);
  expect(receiveEntitlements(entitlements).excluded).toHaveLength(0);
  expect(receiveEntitlements(entitlements).alwaysAvailable).toStrictEqual([
    EntitlementLabel.Cis,
    EntitlementLabel.FipsUpdates,
    EntitlementLabel.Fips,
  ]);
});
