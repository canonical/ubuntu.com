import {
  CodeSnippet,
  CodeSnippetBlockAppearance,
  Col,
  ColProps,
  Row,
  Spinner,
} from "@canonical/react-components";
import classNames from "classnames";
import { useContractToken, useUserSubscriptions } from "advantage/react/hooks";
import { selectSubscriptionById } from "advantage/react/hooks/useUserSubscriptions";
import {
  formatDate,
  getMachineTypeDisplay,
  getPeriodDisplay,
  getSubscriptionCost,
  isFreeSubscription,
  isBlenderSubscription,
} from "advantage/react/utils";
import React, { ReactNode } from "react";

import DetailsTabs from "../DetailsTabs";
import { SelectedId } from "../../Content/types";
import { UserSubscriptionType } from "advantage/api/enum";

type Props = {
  selectedId?: SelectedId;
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

const DetailsContent = ({ selectedId }: Props) => {
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
          Subscription
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
    value: isFree ? "None" : getPeriodDisplay(subscription.period),
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
    <CodeSnippet
      blocks={[
        {
          appearance: CodeSnippetBlockAppearance.URL,
          code: token?.contract_token,
        },
      ]}
      className="u-sv4 u-no-margin--bottom"
    />
  ) : null;

  return (
    <div>
      <Row className="u-sv4">
        {generateFeatures([
          {
            title: "Created",
            value: formatDate(subscription.start_date),
          },
          {
            title: "Expires",
            value: subscription.end_date
              ? formatDate(subscription.end_date)
              : "Never",
          },
          ...(subscription.type === UserSubscriptionType.Legacy
            ? // Don't show the billing column for legacy subscriptions.
              []
            : [billingCol]),
          ...(cost
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
          {
            title: isBlender ? "Users" : "Machines",
            value: subscription.number_of_machines,
          },
          ...(isBlender
            ? // Don't show the column for Blender subscriptions.
              []
            : [
                {
                  title: "Active machines",
                  value: subscription.number_of_active_machines
                },
              ])
        ])}
      </Row>
      {isTokenVisible ? <SubscriptionToken /> : null}
      <DetailsTabs subscription={subscription} token={token} />
    </div>
  );
};

export default DetailsContent;
