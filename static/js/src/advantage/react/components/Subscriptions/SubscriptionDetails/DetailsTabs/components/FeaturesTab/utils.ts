import { EntitlementType } from "advantage/api/enum";
import {
  Feature,
  formatEntitlementToFeature,
  EntitlementsStore,
  EntitlementLabel,
} from "advantage/react/utils/filterAndFormatEntitlements";

export type EntitlementsFormState = Record<EntitlementLabel, Feature>;

export const getNewFeaturesFormState = (
  entitlementsState: EntitlementsFormState,
  newEntitlement?: Feature
): EntitlementsFormState => {
  const newState = Object.entries(entitlementsState).reduce(
    (acc, [key, value]) => {
      return {
        ...acc,
        [key]: {
          ...value,
          isDisabled: value.type === EntitlementType.Support,
          isChecked:
            key === newEntitlement?.label
              ? newEntitlement.isChecked
              : value.isChecked,
        },
      };
    },
    {} as EntitlementsFormState
  );

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

export const initialiseFeaturesForm = (
  features: EntitlementsStore
): EntitlementsFormState =>
  [...features.included, ...features.alwaysAvailable].reduce(
    (acc, entitlementLabel) => ({
      ...acc,
      [entitlementLabel]: formatEntitlementToFeature(
        features.byLabel[entitlementLabel]
      ),
    }),
    {} as EntitlementsFormState
  );
