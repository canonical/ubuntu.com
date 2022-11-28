import { EntitlementType, SupportLevel } from "advantage/api/enum";
import { userSubscriptionEntitlementFactory } from "advantage/tests/factories/api";
import {
  EntitlementLabel,
  getEntitlementLabel,
  filterAndFormatEntitlements,
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
  ];

  expect(filterAndFormatEntitlements(entitlements).byLabel).toEqual({
    "24/7 Support": {
      enabled_by_default: true,
      is_available: true,
      is_editable: false,
      is_in_beta: false,
      support_level: "advanced",
      type: "support",
    },
    "ESM Apps": {
      enabled_by_default: false,
      is_available: false,
      is_editable: false,
      is_in_beta: false,
      support_level: null,
      type: "esm-apps",
    },
    "ESM Infra": {
      enabled_by_default: false,
      is_available: true,
      is_editable: true,
      is_in_beta: false,
      support_level: null,
      type: "esm-infra",
    },
    Livepatch: {
      enabled_by_default: true,
      is_available: true,
      is_editable: true,
      is_in_beta: false,
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
  expect(filterAndFormatEntitlements(entitlements).included).toStrictEqual([
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
  expect(filterAndFormatEntitlements(entitlements).included).toStrictEqual([
    EntitlementLabel.EsmApps,
    EntitlementLabel.EsmInfra,
  ]);
  expect(filterAndFormatEntitlements(entitlements).excluded).toHaveLength(0);
  expect(
    filterAndFormatEntitlements(entitlements).alwaysAvailable
  ).toHaveLength(0);
});

it("correctly groups always available features", () => {
  const entitlements = [
    userSubscriptionEntitlementFactory.build({ type: EntitlementType.Cis }),
    userSubscriptionEntitlementFactory.build({
      type: EntitlementType.FipsUpdates,
    }),
    userSubscriptionEntitlementFactory.build({ type: EntitlementType.Fips }),
  ];
  expect(filterAndFormatEntitlements(entitlements).included).toHaveLength(0);
  expect(filterAndFormatEntitlements(entitlements).excluded).toHaveLength(0);
  expect(
    filterAndFormatEntitlements(entitlements).alwaysAvailable
  ).toStrictEqual([
    EntitlementLabel.Cis,
    EntitlementLabel.FipsUpdates,
    EntitlementLabel.Fips,
  ]);
});
