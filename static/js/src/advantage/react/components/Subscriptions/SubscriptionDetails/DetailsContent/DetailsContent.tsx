import React, { ReactNode } from "react";
import classNames from "classnames";
import {
  Button,
  CodeSnippet,
  CodeSnippetBlockAppearance,
  Col,
  ColProps,
  Row,
  Spinner,
  Tooltip,
} from "@canonical/react-components";
import { UserSubscriptionType } from "advantage/api/enum";
import { useContractToken, useUserSubscriptions } from "advantage/react/hooks";
import { selectSubscriptionById } from "advantage/react/hooks/useUserSubscriptions";
import {
  formatDate,
  getMachineTypeDisplay,
  getPeriodDisplay,
  getSubscriptionCost,
  isBlenderSubscription,
  isFreeSubscription,
} from "advantage/react/utils";
import { sendAnalyticsEvent } from "advantage/react/utils/sendAnalyticsEvent";
import { SelectedId } from "../../Content/types";
import DetailsTabs from "../DetailsTabs";

type Props = {
  selectedId?: SelectedId;
  setHasUnsavedChanges: React.Dispatch<React.SetStateAction<boolean>>;
};

type Feature = {
  valueClassName?: string;
  size?: ColProps["size"];
  title: string;
  value: ReactNode;
};

const generateFeatures = (features: Feature[]) =>
  features.map(({ size = 3, title, value, valueClassName }) => (
    <Col key={title} medium={2} size={size} small={2}>
      <p className="u-text--muted u-no-margin--bottom">{title}</p>
      <p
        className={classNames("u-no-margin--bottom u-sv1", valueClassName)}
        data-test={`${title.toLowerCase().replace(" ", "-")}-col`}
      >
        {value}
      </p>
    </Col>
  ));

const DetailsContent = ({ selectedId, setHasUnsavedChanges }: Props) => {
  const { data: subscription, isLoading } = useUserSubscriptions({
    select: selectSubscriptionById(selectedId),
  });
  const hasAccessToToken = subscription?.statuses.has_access_to_token;
  const isBlender = isBlenderSubscription(subscription);
  const isTokenVisible = hasAccessToToken && !isBlender;

  const { data: token, isLoading: isLoadingToken } = useContractToken(
    subscription?.contract_id,
    isTokenVisible
  );

  const SubscriptionToken = () => {
    return (
      <>
        <h5 className="u-no-padding--top p-subscriptions__details-small-title">
          Token
        </h5>
        {isLoadingToken ? (
          <div className="u-sv4" data-test="token-spinner">
            <Spinner />
          </div>
        ) : (
          tokenBlock
        )}
      </>
    );
  };

  const isFree = isFreeSubscription(subscription);
  if (isLoading || !subscription) {
    return <Spinner />;
  }
  const billingCol: Feature = {
    size: 2,
    title: "Billing",
    value:
      isFree || subscription.type == UserSubscriptionType.KeyActivated
        ? "None"
        : getPeriodDisplay(subscription.period),
  };

  const cost = getSubscriptionCost(subscription);
  const costCol: Feature = {
    // When a legacy subscription is being displayed then stretch this
    // column to take up the space where the billing column would
    // otherwise be.
    size: subscription.type === UserSubscriptionType.Legacy ? 5 : 3,
    title: "Cost",
    value: cost,
  };

  const tokenBlock = token?.contract_token ? (
    <div>
      <CodeSnippet
        blocks={[
          {
            appearance: CodeSnippetBlockAppearance.URL,
            code: token?.contract_token,
          },
        ]}
        className="u-sv4 u-no-margin--bottom u-no-padding--bottom"
        onClick={() => {
          sendAnalyticsEvent({
            eventCategory: "Advantage",
            eventAction: "subscription-token-click",
            eventLabel: "Token copied",
          });
        }}
      />
      <p>Command to attach a machine:{" "}
        <code data-test="contract-token">
          sudo pro attach {token?.contract_token}
        </code></p>
    </div>
  ) : null;

  return (
    <div>
      <Row className="u-sv4">
        {generateFeatures([
          ...(subscription.type === UserSubscriptionType.Legacy
            ? // Don't show the billing column for legacy subscriptions.
            []
            : [billingCol]),
          ...(cost && subscription.type !== UserSubscriptionType.Legacy
            ? // Don't show the cost column if it's empty.
            [costCol]
            : []),
          ...(isBlender
            ? // Don't show the column for Blender subscriptions.
            []
            : [
              {
                title: "Machine type",
                value: getMachineTypeDisplay(subscription.machine_type),
              },
            ]),
          ...(isBlender
            ? // Don't show the column for Blender subscriptions.
            []
            : [
              {
                title: "Active machines",
                value: (
                  <React.Fragment>
                    {subscription.number_of_active_machines}
                    <Tooltip
                      tooltipClassName="p-subscriptions-tooltip"
                      message="The number of machines with this token that contacted Ubuntu Pro in the last 24 hours (Beta)"
                      position="right"
                    >
                      <Button
                        type="button"
                        className="u-no-margin--bottom p-subscriptions-tooltip__button"
                      >
                        <i className="p-icon--information" />
                      </Button>
                    </Tooltip>
                  </React.Fragment>
                ),
              },
            ]),
        ])}
      </Row>
      {isTokenVisible ? <SubscriptionToken /> : null}
      <DetailsTabs
        subscription={subscription}
        token={token}
        setHasUnsavedChanges={setHasUnsavedChanges}
      />
    </div>
  );
};

export default DetailsContent;
