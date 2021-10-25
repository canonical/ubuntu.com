import { EntitlementType } from "advantage/api/enum";
import {
  Feature,
  formatEntitlementToFeature,
  EntitlementsStore,
  EntitlementLabel,
} from "advantage/react/utils/filterAndFormatEntitlements";

export const getNewFeaturesFormState = (
  entitlementsState: Record<string, Feature>,
  newEntitlement?: Feature
): Record<string, Feature> => {
  const newState: Record<string, Feature> = {};

  Object.entries(entitlementsState).forEach(([key, value]) => {
    if (newEntitlement && key === newEntitlement.label) {
      newState[newEntitlement.label] = {
        ...entitlementsState[newEntitlement.label],
        isChecked: newEntitlement.isChecked,
        isDisabled: false,
      };
    } else if (value.type !== EntitlementType.Support) {
      newState[key] = { ...value, isDisabled: false };
    } else {
      newState[key] = { ...value };
    }
  });

  if (newState[EntitlementLabel.Fips]?.isChecked) {
    newState[EntitlementLabel.Livepatch] = {
      ...entitlementsState[EntitlementLabel.Livepatch],
      isChecked: false,
      isDisabled: true,
    };

    newState[EntitlementLabel.FipsUpdates] = {
      ...entitlementsState[EntitlementLabel.FipsUpdates],
      isChecked: false,
      isDisabled: true,
    };
  } else if (
    newState[EntitlementLabel.Livepatch]?.isChecked ||
    newState[EntitlementLabel.FipsUpdates]?.isChecked
  ) {
    newState[EntitlementLabel.Fips] = {
      ...entitlementsState[EntitlementLabel.Fips],
      isChecked: false,
      isDisabled: true,
    };
  }

  return newState;
};

export const initialiseFeaturesForm = (features: EntitlementsStore) => {
  const draftState = {} as Record<string, Feature>;
  features.included.forEach((label) => {
    draftState[label] = formatEntitlementToFeature(features.byLabel[label]);
  });

  features.alwaysAvailable.forEach((label) => {
    draftState[label] = formatEntitlementToFeature(features.byLabel[label]);
  });

  return draftState;
};
