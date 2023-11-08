import React, { useEffect } from "react";
import {
  Button,
  ActionButton,
  Col,
  Row,
  Tooltip,
} from "@canonical/react-components";

import { useUpdateContractEntitlementsMutation } from "advantage/react/hooks";
import { UserSubscription } from "advantage/api/types";
import {
  filterAndFormatEntitlements,
  EntitlementsStore,
  EntitlementLabel,
} from "advantage/react/utils/filterAndFormatEntitlements";
import FeatureSwitch from "advantage/react/components/FeatureSwitch";
import {
  getNewFeaturesFormState,
  initialiseFeaturesForm,
  EntitlementsFormState,
} from "./utils";

import { generateList } from "../../DetailsTabs";

type Props = {
  subscription: UserSubscription;
  setHasUnsavedChanges: React.Dispatch<React.SetStateAction<boolean>>;
};

const FeaturesTab = ({ subscription, setHasUnsavedChanges }: Props) => {
  const [features, setFeatures] = React.useState<EntitlementsStore>(
    filterAndFormatEntitlements(subscription.entitlements)
  );
  const [
    featuresFormState,
    setFeaturesFormState,
  ] = React.useState<EntitlementsFormState>(initialiseFeaturesForm(features));

  const {
    mutateAsync,
    isLoading,
    isError,
  } = useUpdateContractEntitlementsMutation();

  const [entitlementsToUpdate, setEntitlementsToUpdate] = React.useState<
    EntitlementLabel[]
  >([]);

  const handleOnFeatureSwitch = (
    label: EntitlementLabel,
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const isChecked = !!event?.target?.checked;
    const entitlement = { ...featuresFormState[label], isChecked };

    if (features.included.includes(label)) {
      console.log("Included");
    }

    setFeaturesFormState(
      getNewFeaturesFormState(featuresFormState, entitlement)
    );

    if (label)
      if (!entitlementsToUpdate.includes(label)) {
        setEntitlementsToUpdate([...entitlementsToUpdate, label]);
      }
  };

  const handleOnCancel = () => {
    setFeaturesFormState(initialiseFeaturesForm(features));
    setEntitlementsToUpdate([]);
  };

  useEffect(() => {
    const features = filterAndFormatEntitlements(subscription.entitlements);
    const featuresFormState = initialiseFeaturesForm(features);

    setFeatures(features);
    setFeaturesFormState(featuresFormState);
  }, [subscription]);

  useEffect(() => {
    if (entitlementsToUpdate.length <= 0) {
      setHasUnsavedChanges(false);
      window.removeEventListener("beforeunload", alertUser);
    } else {
      setHasUnsavedChanges(true);
      window.addEventListener("beforeunload", alertUser);
    }
    return () => {
      window.removeEventListener("beforeunload", alertUser);
    };
  }, [entitlementsToUpdate]);

  const alertUser = async (e: Event) => {
    e.preventDefault();
    e.returnValue = false;
  };

  const handleSubmit = async (event: React.SyntheticEvent) => {
    event.preventDefault();
    mutateAsync({
      contractId: subscription?.contract_id,
      entitlements: entitlementsToUpdate.map((label) => ({
        type: featuresFormState[label].type,
        is_enabled: featuresFormState[label].isChecked,
      })),
    })
      .catch(() => {
        handleOnCancel();
      })
      .finally(() => {
        setEntitlementsToUpdate([]);
      });
  };

  return (
    <form
      className="p-form"
      onSubmit={handleSubmit}
      data-testid="features-content"
    >
      <Row className="u-sv1" data-testid="included-features">
        <Col size={12}>
          {features.included.length
            ? generateList(
                <div>
                  <h5>Default settings</h5>
                  <p>
                    Changing the default settings of this subscription will
                    affect the default enablement setting for machines attached{" "}
                    <strong>after</strong> the changes are made
                  </p>
                  <p>
                    Please note that changes to these settings{" "}
                    <strong>will not</strong> impact machines that were already
                    attached.
                  </p>
                </div>,
                features.included.map((label) => ({
                  label: (
                    <div className="p-subscription-switch-wrapper">
                      <FeatureSwitch
                        key={label}
                        isChecked={featuresFormState[label]?.isChecked}
                        isDisabled={featuresFormState[label]?.isDisabled}
                        handleOnChange={(event) =>
                          handleOnFeatureSwitch(label, event)
                        }
                      >
                        {label}
                      </FeatureSwitch>
                      {label === EntitlementLabel.EsmApps &&
                      featuresFormState[label]?.isDisabled ? (
                        <Tooltip
                          tooltipClassName="p-subscriptions-tooltip"
                          message="ESM Apps is in beta for your contract. To enable it on a machine, run `sudo pro enable esm-apps`."
                        >
                          <Button
                            type="button"
                            className="u-no-margin--bottom p-subscriptions-tooltip__button"
                          >
                            <i className="p-icon--information" />
                          </Button>
                        </Tooltip>
                      ) : null}
                    </div>
                  ),
                }))
              )
            : null}
        </Col>
      </Row>
      <Row>
        <Col size={12} data-testid="excluded-features">
          {features.excluded.length
            ? generateList(
                <div>
                  Not included
                  <Tooltip
                    tooltipClassName="p-subscriptions-tooltip"
                    message="Not available with your subscription"
                  >
                    <Button
                      type="button"
                      className="u-no-margin--bottom p-subscriptions-tooltip__button"
                    >
                      <i className="p-icon--information" />
                    </Button>
                  </Tooltip>
                </div>,
                features.excluded.map((label) => ({
                  icon: "error",
                  label: label,
                }))
              )
            : null}
        </Col>
      </Row>
      <Row className="u-sv1" data-testid="always-available-features">
        <Col size={12}>
          {features.alwaysAvailable.length
            ? generateList(
                <>
                  For compliance & hardening services:{" "}
                  <span style={{ fontWeight: 300 }}>
                    please read the{" "}
                    <a href="https://ubuntu.com/security/certifications/docs">
                      documentation
                    </a>{" "}
                    and only enable these features if you specifically require
                    these certifications.
                  </span>
                </>,
                features.alwaysAvailable.map((label) => ({
                  label: (
                    <div className="p-subscription-switch-wrapper">
                      <FeatureSwitch
                        key={label}
                        isChecked={featuresFormState[label]?.isChecked}
                        isDisabled={featuresFormState[label]?.isDisabled}
                        handleOnChange={(event) =>
                          handleOnFeatureSwitch(label, event)
                        }
                      >
                        {label}
                      </FeatureSwitch>
                      {label === EntitlementLabel.Fips ||
                      label === EntitlementLabel.FipsUpdates ? (
                        <Tooltip
                          tooltipClassName="p-subscriptions-tooltip"
                          message={
                            label === EntitlementLabel.Fips
                              ? "Enabling FIPS will disable Livepatch and FIPS-Updates"
                              : "Enabling FIPS-Updates will disable FIPS"
                          }
                        >
                          <Button
                            type="button"
                            className="u-no-margin--bottom p-subscriptions-tooltip__button"
                          >
                            <i className="p-icon--information" />
                          </Button>
                        </Tooltip>
                      ) : null}
                    </div>
                  ),
                }))
              )
            : null}
        </Col>
      </Row>
      <div className="row"></div>
      {isError ? (
        <div className="p-notification--negative">
          <div className="p-notification__content">
            <h5 className="p-notification__title">Error</h5>
            <p className="p-notification__message" role="alert">
              Something went wrong. Please try again later.
            </p>
          </div>
        </div>
      ) : null}
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
      <Row>
        <Col size={12}>
          <h5>Service enablement for individual machines</h5>
          <p>
            To disable services on machines that were already attached, please
            run:
          </p>
          <code>$ sudo pro disable &lt;services&gt;</code>
          <p>
            To enable services on machines attached to a subscription with
            specific features turned off by default, please run:
            <code>$ sudo pro enable &lt;services&gt;</code>
          </p>
          <a href="/legal/ubuntu-pro-description">
            Service description &rsaquo;
          </a>
        </Col>
      </Row>
    </form>
  );
};

export default FeaturesTab;
