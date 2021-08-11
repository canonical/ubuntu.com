import type { ContractInfo } from "advantage/api/contracts-types";
import { EntitlementType, SupportLevel } from "advantage/api/enum";
import { dedupeArray } from "./dedupeArray";
import { removeFalsy } from "./removeFalsy";

enum EntitlementLabelType {
  SUPPORT_STANDARD = "support-5",
  SUPPORT_ADVANCED = "support-7",
}

type EntitlementBaseType = Exclude<
  EntitlementType,
  EntitlementType.SUPPORT | EntitlementType.LIVEPATCH_ONPREM
>;

type LabelType = EntitlementLabelType | EntitlementBaseType;

const baseLabels: Record<EntitlementBaseType, string | null> = {
  [EntitlementType.BLENDER]: "Blender",
  [EntitlementType.CC_EAL]: null,
  [EntitlementType.CIS]: null,
  [EntitlementType.ESM_APPS]: "ESM Apps",
  [EntitlementType.ESM_INFRA]: "ESM Infra",
  [EntitlementType.FIPS_UPDATES]: null,
  [EntitlementType.FIPS]: null,
  [EntitlementType.LIVEPATCH]: "Livepatch",
};

const includeLabels: Record<LabelType, string | null> = {
  ...baseLabels,
  [EntitlementLabelType.SUPPORT_STANDARD]: "24/5 Support",
  [EntitlementLabelType.SUPPORT_ADVANCED]: "24/7 Support",
};

const excludeLabels: Record<LabelType, string | null> = {
  ...baseLabels,
  [EntitlementLabelType.SUPPORT_STANDARD]: "Support",
  [EntitlementLabelType.SUPPORT_ADVANCED]: "Support",
};

/**
 * Map the entitlements to the display label.
 */
const generateLabels = (entitlements: LabelType[], included: boolean) => {
  const labels = included ? includeLabels : excludeLabels;
  // Remove any labels that have been mapped to `null` i.e. should not be displayed.
  return removeFalsy(
    // Remove any duplicate labels.
    dedupeArray(
      entitlements.map((feature) =>
        labels.hasOwnProperty(feature)
          ? labels[feature]
          : // Ignore any features there is no label for.
            null
      )
    )
  );
};

export const getFeaturesDisplay = (contractInfo: ContractInfo) => {
  const included: LabelType[] = [];
  contractInfo.resourceEntitlements.forEach((entitlement) => {
    let entitlementType: string | null = null;
    if (
      entitlement.type === "support" &&
      "supportLevel" in entitlement.affordances
    ) {
      // Map any support features to their appropriate level.
      switch (entitlement.affordances.supportLevel) {
        case SupportLevel.STANDARD:
          entitlementType = EntitlementLabelType.SUPPORT_STANDARD;
          break;
        case SupportLevel.ADVANCED:
          entitlementType = EntitlementLabelType.SUPPORT_ADVANCED;
          break;
        // Don't display anything for none and essential levels.
        case SupportLevel.NONE:
        case SupportLevel.ESSENTIAL:
        default:
          entitlementType = null;
          break;
      }
    } else {
      switch (entitlement.type) {
        // Map livepatch-onprem to livepatch as they will both get displayed as
        // the same thing.
        case EntitlementType.LIVEPATCH_ONPREM:
          entitlementType = EntitlementType.LIVEPATCH;
          break;
        default:
          entitlementType = entitlement.type;
          break;
      }
    }
    if (entitlementType) {
      included.push(entitlementType as LabelType);
    }
  });
  // Find all the features that have not been included to display in the
  // excluded list.
  const excluded = Object.keys(excludeLabels).reduce<LabelType[]>(
    (features, feature) => {
      if (
        feature === EntitlementLabelType.SUPPORT_STANDARD ||
        feature === EntitlementLabelType.SUPPORT_ADVANCED
      ) {
        // If either support level has been added to the included list then do
        // not add anything other support levels to the excluded list.
        if (
          !included.includes(EntitlementLabelType.SUPPORT_STANDARD) &&
          !included.includes(EntitlementLabelType.SUPPORT_ADVANCED)
        ) {
          features.push(feature as LabelType);
        }
      } else if (!included.includes(feature as LabelType)) {
        features.push(feature as LabelType);
      }
      return features;
    },
    []
  );
  return {
    excluded: generateLabels(excluded, false),
    included: generateLabels(included, true),
  };
};
