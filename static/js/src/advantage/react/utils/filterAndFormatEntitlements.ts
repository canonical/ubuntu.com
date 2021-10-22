import { EntitlementType, SupportLevel } from "advantage/api/enum";
import { UserSubscriptionEntitlement } from "advantage/api/types";

const labels: Record<EntitlementType, string | null> = {
  [EntitlementType.Blender]: "Blender",
  [EntitlementType.CcEal]: null,
  [EntitlementType.Cis]: "CIS",
  [EntitlementType.EsmApps]: "ESM Apps",
  [EntitlementType.EsmInfra]: "ESM Infra",
  [EntitlementType.FipsUpdates]: "FIPS-Updates",
  [EntitlementType.Fips]: "FIPS",
  [EntitlementType.Livepatch]: "Livepatch",
  [EntitlementType.LivepatchOnprem]: "Livepatch",
  [EntitlementType.Support]: null,
};

const alwaysAvailableFeatures = [
  EntitlementType.Cis.toString(),
  EntitlementType.FipsUpdates.toString(),
  EntitlementType.Fips.toString(),
];

const supportLabels: Record<SupportLevel, string | null> = {
  [SupportLevel.None]: null,
  [SupportLevel.Essential]: null,
  [SupportLevel.Standard]: "24/5 Support",
  [SupportLevel.Advanced]: "24/7 Support",
};

export type Feature = {
  isChecked: boolean;
  isDisabled: boolean;
  label: string | null;
  type: EntitlementType;
};

const formatEntitlementToFeature = (
  entitlement: UserSubscriptionEntitlement
): Feature => ({
  type: entitlement.type as EntitlementType,
  label: entitlement.support_level
    ? supportLabels[entitlement.support_level]
    : labels[entitlement.type as EntitlementType],
  isChecked: entitlement.enabled_by_default,
  isDisabled: !entitlement.is_editable,
});

export type FeaturesDisplay = {
  included: Feature[];
  excluded: Feature[];
  alwaysAvailable: Feature[];
};

export const filterAndFormatEntitlements = (
  entitlements: UserSubscriptionEntitlement[]
): FeaturesDisplay => {
  const included: Feature[] = [];
  const excluded: Feature[] = [];
  const alwaysAvailable: Feature[] = [];

  entitlements.forEach((entitlement) => {
    if (alwaysAvailableFeatures.includes(entitlement.type)) {
      alwaysAvailable.push(formatEntitlementToFeature(entitlement));
    } else if (entitlement.is_available) {
      included.push(formatEntitlementToFeature(entitlement));
    } else if (
      !entitlement.is_available &&
      !entitlement.is_editable &&
      !included.find((e) => e.type === entitlement.type)
    ) {
      excluded.push(formatEntitlementToFeature(entitlement));
    }
  });

  return { included, excluded, alwaysAvailable };
};
