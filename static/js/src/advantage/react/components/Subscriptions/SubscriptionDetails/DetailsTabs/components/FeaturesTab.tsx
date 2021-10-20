import React, { useEffect } from "react";
import { Button, ActionButton, Col, Row } from "@canonical/react-components";
import { EntitlementType } from "advantage/api/enum";

import { UserSubscription } from "advantage/api/types";
import FeatureSwitch from "../../../../FeatureSwitch";
import { generateList } from "../DetailsTabs";

import { useUpdateContractEntitlementsMutation } from "../../../../../hooks";
import {
  filterAndFormatEntitlements,
  FeaturesDisplay,
  Feature,
} from "advantage/react/utils/filterAndFormatEntitlements";

const getNewFeaturesFormState = (
  entitlementsState: Record<string, Feature>,
  newEntitlement: { type: EntitlementType; isChecked: boolean }
): Record<string, Feature> => {
  const newState = {
    ...entitlementsState,
    [newEntitlement.type]: {
      ...entitlementsState[newEntitlement.type],
      isChecked: newEntitlement.isChecked,
      isDisabled: false,
    },
  };

  Object.entries(newState).forEach(([key, value]) => {
    if (key !== EntitlementType.Support) {
      newState[key] = { ...value, isDisabled: false };
    }
  });

  if (newState[EntitlementType.Fips].isChecked) {
    newState[EntitlementType.Livepatch].isChecked = false;
    newState[EntitlementType.Livepatch].isDisabled = true;

    newState[EntitlementType.FipsUpdates].isChecked = false;
    newState[EntitlementType.FipsUpdates].isDisabled = true;
  } else if (
    newState[EntitlementType.Livepatch].isChecked ||
    newState[EntitlementType.FipsUpdates].isChecked
  ) {
    newState[EntitlementType.Fips].isChecked = false;
    newState[EntitlementType.Fips].isDisabled = true;
  }

  return newState;
};

const getFeaturesForm = (features: FeaturesDisplay) => {
  const draftState: Record<string, Feature> = {};
  features.alwaysAvailable.forEach((feature) => {
    draftState[feature.type] = { ...feature };
  });
  features.included.forEach((feature) => {
    draftState[feature.type] = { ...feature };
  });

  return draftState;
};

type EntitlementToUpdate = {
  type: EntitlementType;
  isChecked: boolean;
};

const FeaturesTab = ({ subscription }: { subscription: UserSubscription }) => {
  const featuresDisplay = filterAndFormatEntitlements(
    subscription.entitlements
  );
  const [features, setFeatures] = React.useState<FeaturesDisplay>(
    featuresDisplay
  );
  const [featuresFormState, setFeaturesFormState] = React.useState(
    getFeaturesForm(featuresDisplay)
  );

  const { mutateAsync, isLoading } = useUpdateContractEntitlementsMutation();

  const [entitlementsToUpdate, setEntitlementsToUpdate] = React.useState<
    EntitlementToUpdate[]
  >([]);

  const handleOnFeatureSwitch = (
    type: EntitlementType,
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const isChecked = !!event?.target?.checked;
    const entitlement = { type, isChecked };

    setEntitlementsToUpdate((entitlements) => [...entitlements, entitlement]);

    setFeaturesFormState(
      getNewFeaturesFormState(featuresFormState, entitlement)
    );
  };

  const handleOnCancel = () => {
    setFeaturesFormState(getFeaturesForm(featuresDisplay));
    setEntitlementsToUpdate([]);
  };

  useEffect(() => {
    const features = filterAndFormatEntitlements(subscription.entitlements);
    const featuresFormState = getFeaturesForm(features);

    setFeatures(features);
    setFeaturesFormState(featuresFormState);
  }, [subscription]);

  const handleSubmit = async (event: React.SyntheticEvent) => {
    event.preventDefault();
    mutateAsync({
      contractId: subscription?.contract_id,
      entitlements: entitlementsToUpdate.map((entitlement) => ({
        type: entitlement.type,
        isEnabled: entitlement.isChecked,
      })),
    }).finally(() => {
      setEntitlementsToUpdate([]);
    });
  };

  return (
    <form className="p-form" onSubmit={handleSubmit}>
      <Row className="u-sv1" data-test="features-content">
        <Col size={4}>
          {features.included.length ? (
            <>
              <h5 className="u-no-padding--top p-subscriptions__details-small-title">
                Included
              </h5>
              {features.included.map(({ type, label }) => {
                return (
                  <FeatureSwitch
                    key={type}
                    isChecked={featuresFormState[type]?.isChecked}
                    isDisabled={featuresFormState[type]?.isDisabled}
                    handleOnChange={(event) =>
                      handleOnFeatureSwitch(type, event)
                    }
                  >
                    {label}
                  </FeatureSwitch>
                );
              })}
            </>
          ) : null}
        </Col>
        <Col size={4}>
          {features.excluded.length
            ? generateList(
                "Not included",
                features.excluded.map(({ label }) => ({
                  icon: "error",
                  label: label,
                }))
              )
            : null}
        </Col>
      </Row>
      <hr className="p-subscriptions-separator" />
      <Row className="u-sv1" data-test="features-content">
        <Col size={8}>
          {features.included.length
            ? generateList(
                "Compliance & Hardening",
                features.alwaysAvailable.map(({ type, label }) => ({
                  label: (
                    <FeatureSwitch
                      key={type}
                      isChecked={featuresFormState[type]?.isChecked}
                      isDisabled={featuresFormState[type]?.isDisabled}
                      handleOnChange={(event) =>
                        handleOnFeatureSwitch(type, event)
                      }
                    >
                      {label}
                    </FeatureSwitch>
                  ),
                }))
              )
            : null}
        </Col>
      </Row>
      <p>
        <a href="/legal/ubuntu-advantage-service-description">
          Service description &rsaquo;
        </a>
      </p>
      <div className="row"></div>
      {entitlementsToUpdate.length > 0 ? (
        <div className="u-align--right">
          <div className="p-notification--caution">
            <div className="p-notification__content">
              <p className="p-notification__message" role="alert">
                Changes will only affect new clients attached to this
                subscription.
              </p>
            </div>
          </div>
          <div>
            <Button type="button" onClick={handleOnCancel}>
              Cancel
            </Button>
            <ActionButton
              type="submit"
              appearance="positive"
              loading={isLoading}
              disabled={isLoading}
            >
              Save
            </ActionButton>
          </div>
        </div>
      ) : null}
    </form>
  );
};

export default FeaturesTab;
