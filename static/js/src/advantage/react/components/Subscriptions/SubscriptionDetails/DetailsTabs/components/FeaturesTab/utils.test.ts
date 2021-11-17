import { EntitlementType, SupportLevel } from "advantage/api/enum";
import { userSubscriptionEntitlementFactory } from "advantage/tests/factories/api";
import {
  EntitlementLabel,
  filterAndFormatEntitlements,
} from "advantage/react/utils/filterAndFormatEntitlements";
import { initialiseFeaturesForm, getNewFeaturesFormState } from "./utils";

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
];

it("returns correctly formatted features form state", () => {
  const featuresForm = initialiseFeaturesForm(
    filterAndFormatEntitlements(entitlements)
  );

  expect(featuresForm).toStrictEqual({
    "24/7 Support": {
      isChecked: true,
      isDisabled: true,
      label: "24/7 Support",
      type: "support",
    },
    "ESM Infra": {
      isChecked: false,
      isDisabled: false,
      label: "ESM Infra",
      type: "esm-infra",
    },
    Livepatch: {
      isChecked: true,
      isDisabled: false,
      label: "Livepatch",
      type: "livepatch",
    },
  });
});

it("returns new features form state", () => {
  const featuresForm = initialiseFeaturesForm(
    filterAndFormatEntitlements(entitlements)
  );

  expect(featuresForm[EntitlementLabel.Livepatch]).toHaveProperty(
    "isChecked",
    true
  );

  const newFeatureState = {
    ...featuresForm[EntitlementLabel.Livepatch],
    isChecked: false,
  };

  const newFeaturesFormState = getNewFeaturesFormState(
    featuresForm,
    newFeatureState
  );
  expect(newFeaturesFormState[EntitlementLabel.Livepatch]).toHaveProperty(
    "isChecked",
    false
  );
  expect(newFeaturesFormState[EntitlementLabel.Livepatch]).toHaveProperty(
    "isDisabled",
    false
  );
});
