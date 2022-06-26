import React, { useEffect, useState } from "react";
import {
  Button,
  ActionButton,
  Col,
  Row,
  Tooltip,
  Modal,
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

const FeaturesTab = ({ subscription }: { subscription: UserSubscription }) => {
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

  const [modalOpen, setModalOpen] = useState(false);
  const closeHandler = () => setModalOpen(false);


  const handleOnFeatureSwitch = (
    label: EntitlementLabel,
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const isChecked = !!event?.target?.checked;
    const entitlement = { ...featuresFormState[label], isChecked };

    setFeaturesFormState(
      getNewFeaturesFormState(featuresFormState, entitlement)
    );

    if (!entitlementsToUpdate.includes(label)) {
      setEntitlementsToUpdate([...entitlementsToUpdate, label]);
    }
    handleSubmit(event);
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

  useEffect(()=>{
    window.addEventListener('beforeunload', alertUser);
    window.addEventListener('unload',alertUser);
    return () => {
      window.removeEventListener('beforeunload', alertUser);
      window.removeEventListener('unload', alertUser);
    };
  },[]);

  const alertUser = (event: { preventDefault: () => void; }) =>{
    event.preventDefault();
    setModalOpen(true);
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
      {modalOpen ? <Modal close={closeHandler} title="Confirm delete" buttonRow={<>
                  <button className="u-no-margin--bottom" onClick={closeHandler}>
                    Cancel
                  </button>
                  <button className="p-button--negative u-no-margin--bottom">
                    Delete
                  </button>
                </>}>
              <p>
                Are you sure you want to delete user Simon? This action is
                permanent and can not be undone.
              </p>
            </Modal> : null}
      <Row className="u-sv1" data-testid="included-features">
        <Col size={4}>
          {features.included.length
            ? generateList(
                "Included",
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
                    </div>
                  ),
                }))
              )
            : null}
        </Col>
        <Col size={4} data-testid="excluded-features">
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
      <hr className="p-subscriptions-separator" />
      <Row className="u-sv1" data-testid="always-available-features">
        <Col size={12}>
          {features.alwaysAvailable.length
            ? generateList(
                <>
                  Compliance & Hardening:{" "}
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
      <p>
        <a href="/legal/ubuntu-advantage-service-description">
          Service description &rsaquo;
        </a>
      </p>
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
      
    </form>
  );
};

export default FeaturesTab;
