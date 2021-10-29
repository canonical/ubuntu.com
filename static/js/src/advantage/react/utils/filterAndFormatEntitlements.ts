import { EntitlementType, SupportLevel } from "advantage/api/enum";
import { UserSubscriptionEntitlement } from "advantage/api/types";

export enum EntitlementLabel {
  Cis = "CIS",
  Blender = "Blender",
  EsmInfra = "ESM Infra",
  FipsUpdates = "FIPS-Updates",
  Fips = "FIPS",
  Livepatch = "Livepatch",
  SupportStandard = "24/5 Support",
  SupportAdvanced = "24/7 Support",
}

const alwaysAvailableLabels: Record<string, EntitlementLabel> = {
  [EntitlementType.Cis]: EntitlementLabel.Cis,
  [EntitlementType.Fips]: EntitlementLabel.Fips,
  [EntitlementType.FipsUpdates]: EntitlementLabel.FipsUpdates,
};

const labels: Record<string, EntitlementLabel | null> = {
  [EntitlementType.Blender]: EntitlementLabel.Blender,
  [EntitlementType.CcEal]: null,
  [EntitlementType.EsmApps]: null,
  [EntitlementType.EsmInfra]: EntitlementLabel.EsmInfra,
  [EntitlementType.Livepatch]: EntitlementLabel.Livepatch,
  [EntitlementType.LivepatchOnprem]: EntitlementLabel.Livepatch,
  ...alwaysAvailableLabels,
};

const supportLabels: Record<string, EntitlementLabel | null> = {
  [SupportLevel.None]: null,
  [SupportLevel.Essential]: null,
  [SupportLevel.Standard]: EntitlementLabel.SupportStandard,
  [SupportLevel.Advanced]: EntitlementLabel.SupportAdvanced,
};

export type Feature = {
  isChecked: boolean;
  isDisabled: boolean;
  label?: EntitlementLabel | null;
  type: EntitlementType;
};

export const getEntitlementLabel = (
  entitlement: UserSubscriptionEntitlement
): EntitlementLabel | undefined | null =>
  entitlement.support_level
    ? supportLabels[entitlement.support_level]
    : labels[entitlement.type as EntitlementType];

export const formatEntitlementToFeature = (
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

export type EntitlementsByLabel = Record<
  EntitlementLabel,
  UserSubscriptionEntitlement
>;
export type EntitlementsStore = {
  byLabel: EntitlementsByLabel;
  included: EntitlementLabel[];
  excluded: EntitlementLabel[];
  alwaysAvailable: EntitlementLabel[];
};

type EntitlementGroups = {
  included: EntitlementLabel[];
  excluded: EntitlementLabel[];
  alwaysAvailable: EntitlementLabel[];
};

export const groupEntitlements = (
  entitlements: UserSubscriptionEntitlement[]
): EntitlementGroups => {
  const included: EntitlementLabel[] = [];
  const excluded: EntitlementLabel[] = [];
  const alwaysAvailable: EntitlementLabel[] = [];

  entitlements.forEach((entitlement) => {
    const label = getEntitlementLabel(entitlement);
    if (label && !included.includes(label) && !excluded.includes(label)) {
      if (entitlement.type in alwaysAvailableLabels) {
        alwaysAvailable.push(label);
      } else if (entitlement.is_available) {
        included.push(label);
      } else if (!entitlement.is_available && !entitlement.is_editable) {
        excluded.push(label);
      }
    }
  });

  return { included, excluded, alwaysAvailable };
};

const filterEntitlements = ({
  excluded,
  ...entitlements
}: EntitlementGroups): EntitlementGroups => ({
  ...entitlements,
  excluded: excluded.filter(
    (label) => !Object.values(supportLabels).includes(label)
  ),
});

export const filterAndFormatEntitlements = (
  entitlements: UserSubscriptionEntitlement[]
): EntitlementsStore => {
  const allLabels: EntitlementLabel[] = [];
  const { included, excluded, alwaysAvailable } = filterEntitlements(
    groupEntitlements(entitlements)
  );

  const byLabel = entitlements.reduce((acc, entitlement) => {
    const label = getEntitlementLabel(entitlement);
    if (label && !allLabels.includes(label)) {
      acc[label] = entitlement;
      allLabels.push(label);
    }
    return acc;
  }, {} as EntitlementsByLabel);

  return {
    byLabel,
    included,
    excluded,
    alwaysAvailable,
  };
};
