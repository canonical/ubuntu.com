import { Card, Col, List, Row } from "@canonical/react-components";
import React from "react";
import classNames from "classnames";
import {
  formatDate,
  getFeaturesDisplay,
  isFreeSubscription,
  makeInteractiveProps,
} from "advantage/react/utils";
import { UserSubscription } from "advantage/api/types";
import ExpiryNotification from "../../ExpiryNotification";
import { ExpiryNotificationSize } from "../../ExpiryNotification/ExpiryNotification";

type Props = {
  isSelected?: boolean;
  onClick: () => void;
  subscription: UserSubscription;
};

const ListCard = ({
  isSelected,
  onClick,
  subscription,
}: Props): JSX.Element => {
  const isFree = isFreeSubscription(subscription);
  return (
    <Card
      className={classNames("p-subscriptions__list-card", {
        "is-active": isSelected,
      })}
      {...makeInteractiveProps(onClick)}
    >
      <ExpiryNotification
        className="p-subscriptions__list-card-notification is-dense"
        size={ExpiryNotificationSize.Small}
        statuses={subscription.statuses}
      />
      <div className="p-subscriptions__list-card-title">
        <h5
          className="u-no-padding--top u-no-margin--bottom"
          data-test="card-title"
        >
          {isFree ? "Free Personal Token" : subscription.product_name}
        </h5>
        <span
          className="p-text--x-small-capitalised u-text--muted p-subscriptions__list-card-period"
          data-test="card-type"
        >
          {subscription.type}
        </span>
      </div>
      <Row>
        <Col medium={3} size={3} small={1}>
          <p className="u-text--muted u-no-margin--bottom">Machines</p>
          <span data-test="card-machines">
            {subscription.number_of_machines}
          </span>
        </Col>
        <Col medium={3} size={4} small={1}>
          <p className="u-text--muted u-no-margin--bottom">Created</p>
          <span data-test="card-start-date">
            {formatDate(subscription.start_date)}
          </span>
        </Col>
        <Col medium={3} size={4} small={1}>
          <p className="u-text--muted u-no-margin--bottom">Expires</p>
          <span data-test="card-end-date">
            {subscription.end_date
              ? formatDate(subscription.end_date)
              : "Never"}
          </span>
        </Col>
      </Row>
      <List
        className="p-subscriptions__list-card-features p-text--x-small-capitalised u-text--muted u-no-margin--bottom"
        data-test="card-entitlements"
        inline
        items={getFeaturesDisplay(subscription.entitlements).included}
      />
    </Card>
  );
};

export default ListCard;
