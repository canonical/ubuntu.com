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

type Feature = {
  isChecked: boolean;
  isDisabled: boolean;
  label: string;
};

export const getFeaturesDisplay = (
  entitlements: UserSubscriptionEntitlement[]
) => {
  const included: Feature[] = [];
  const excluded: Feature[] = [];
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
    if (
      label &&
      !included.find((feature) => feature.label === label) &&
      !excluded.find((feature) => feature.label === label)
    ) {
      if (!entitlement.is_available && !entitlement.is_editable) {
        excluded.push({
          isChecked: entitlement.enabled_by_default,
          isDisabled: !entitlement.is_editable,
          label,
        });
      } else {
        included.push({
          isChecked: entitlement.enabled_by_default,
          isDisabled: !entitlement.is_editable,
          label,
        });
      }
    }
  });
  return {
    excluded,
    included,
  };
};

const alwaysAvailableLabels: Record<string, string | null> = {
  [EntitlementType.Cis]: "CIS",
  [EntitlementType.FipsUpdates]: "FIPS-Updates",
  [EntitlementType.Fips]: "FIPS",
};

export const getAlwaysAvailableFeatures = (
  entitlements: UserSubscriptionEntitlement[]
) => {
  const features: Feature[] = [];
  entitlements.forEach((entitlement) => {
    let label: string | null = null;
    if (entitlement.type in alwaysAvailableLabels) {
      label = alwaysAvailableLabels[entitlement.type];
    }
    if (label) {
      features.push({
        isChecked: entitlement.enabled_by_default,
        isDisabled: !entitlement.is_editable,
        label,
      });
    }
  });
  return features;
};
