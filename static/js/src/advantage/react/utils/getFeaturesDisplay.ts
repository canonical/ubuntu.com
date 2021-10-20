import { EntitlementType, SupportLevel } from "advantage/api/enum";
import { UserSubscriptionEntitlement } from "advantage/api/types";

const labels: Record<string, string | null> = {
  [EntitlementType.Blender]: "Blender",
  [EntitlementType.CcEal]: null,
  [EntitlementType.Cis]: null,
  [EntitlementType.EsmApps]: "ESM Apps",
  [EntitlementType.EsmInfra]: "ESM Infra",
  [EntitlementType.FipsUpdates]: null,
  [EntitlementType.Fips]: null,
  [EntitlementType.Livepatch]: "Livepatch",
  [EntitlementType.LivepatchOnprem]: "Livepatch",
};

export const getFeaturesDisplay = (
  entitlements: UserSubscriptionEntitlement[]
) => {
  const included: string[] = [];
  const excluded: string[] = [];
  entitlements.forEach((entitlement) => {
    let label: string | null = null;
    if (
      entitlement.type === EntitlementType.Support &&
      entitlement.support_level
    ) {
      // Map any support features to their appropriate level. Nothing needs to
      // be displayed for "none" and "essential" levels.
      switch (entitlement.support_level) {
        case SupportLevel.Standard:
          label = "24/5 Support";
          break;
        case SupportLevel.Advanced:
          label = "24/7 Support";
          break;
      }
    } else if (entitlement.type in labels) {
      label = labels[entitlement.type];
    }
    if (label && !included.includes(label) && !excluded.includes(label)) {
      if (entitlement.enabled_by_default) {
        included.push(label);
      } else {
        excluded.push(label);
      }
    }
  });
  return {
    excluded,
    included,
  };
};
