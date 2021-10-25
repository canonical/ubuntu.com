import { EntitlementType, SupportLevel } from "advantage/api/enum";
import { userSubscriptionEntitlementFactory } from "advantage/tests/factories/api";
import { getNewFeaturesFormState } from "./utils";

it("generates display labels for features", () => {
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
  expect(getNewFeaturesFormState(entitlements)).toStrictEqual([
    "ESM Infra",
    "Livepatch",
    "24/7 Support",
  ]);
});
