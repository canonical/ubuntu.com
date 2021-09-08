import {
  CodeSnippet,
  CodeSnippetBlockAppearance,
  Col,
  ColProps,
  Row,
  Spinner,
} from "@canonical/react-components";
import classNames from "classnames";
import { useUserSubscriptions } from "advantage/react/hooks";
import { selectSubscriptionById } from "advantage/react/hooks/useUserSubscriptions";
import {
  formatDate,
  getMachineTypeDisplay,
  getPeriodDisplay,
  getSubscriptionCost,
  isFreeSubscription,
} from "advantage/react/utils";
import React, { ReactNode } from "react";

import DetailsTabs from "../DetailsTabs";
import { SelectedId } from "../../Content/types";

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
  const isFree = isFreeSubscription(subscription);
  if (isLoading || !subscription) {
    return <Spinner />;
  }
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
          {
            size: 2,
            title: "Billing",
            value: isFree ? "None" : getPeriodDisplay(subscription.period),
          },
          {
            title: "Cost",
            value: getSubscriptionCost(subscription),
          },
          {
            title: "Machine type",
            value: getMachineTypeDisplay(subscription.machine_type),
          },
          {
            title: "Machines",
            value: subscription.number_of_machines,
          },
        ])}
      </Row>
      <h5 className="u-no-padding--top p-subscriptions__details-small-title">
        Subscription
      </h5>
      <CodeSnippet
        blocks={[
          {
            appearance: CodeSnippetBlockAppearance.URL,
            // TODO: display the token when it is available from the API.
            code: "abc123",
          },
        ]}
        className="u-sv4 u-no-margin--bottom"
      />
      <DetailsTabs />
    </div>
  );
};

export default DetailsContent;
