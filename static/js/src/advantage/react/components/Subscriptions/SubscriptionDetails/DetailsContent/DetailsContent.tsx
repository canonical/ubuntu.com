import {
  CodeSnippet,
  CodeSnippetBlockAppearance,
  Col,
  ColProps,
  Row,
  Spinner,
} from "@canonical/react-components";
import classNames from "classnames";
import { UserSubscriptionType } from "advantage/api/types";
import { useUserSubscriptions } from "advantage/react/hooks";
import { selectFreeSubscription } from "advantage/react/hooks/useUserSubscriptions";
import { formatDate } from "advantage/react/utils";
import React, { ReactNode } from "react";

import DetailsTabs from "../DetailsTabs";

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

const DetailsContent = () => {
  const { data: subscription, isLoading } = useUserSubscriptions({
    // TODO: Get the selected subscription once the subscription token is available.
    select: selectFreeSubscription,
  });
  const isFreeSubscription = subscription?.type === UserSubscriptionType.Free;
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
            value: isFreeSubscription ? "Never" : null,
          },
          {
            size: 2,
            title: "Billing",
            value: isFreeSubscription ? "None" : null,
          },
          {
            title: "Cost",
            value: isFreeSubscription ? "Free" : null,
          },
          {
            title: "Machine type",
            value: subscription.machine_type,
            valueClassName: "u-text--capitalise-first",
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
