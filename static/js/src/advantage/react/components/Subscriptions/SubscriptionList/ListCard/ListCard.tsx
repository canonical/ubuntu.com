import { Card, Col, List, Row } from "@canonical/react-components";
import React, { ReactNode } from "react";
import classNames from "classnames";
import {
  formatDate,
  getFeaturesDisplay,
  isBlenderSubscription,
  isFreeSubscription,
  makeInteractiveProps,
} from "advantage/react/utils";
import { UserSubscription } from "advantage/api/types";
import ExpiryNotification from "../../ExpiryNotification";
import {
  ExpiryNotificationSize,
  ORDERED_STATUS_KEYS,
} from "../../ExpiryNotification/ExpiryNotification";
import { UserSubscriptionType } from "advantage/api/enum";

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
  const isBlender = isBlenderSubscription(subscription);
  // If the subscription statuses is true for any of the expiry status keys then
  // a notification will be displayed.
  const hasExpiryNotification = !!ORDERED_STATUS_KEYS.find(
    (status) => subscription.statuses[status]
  );
  let expiryNotification: ReactNode = null;
  if (hasExpiryNotification) {
    expiryNotification = (
      <>
        <div className="p-card__inner u-no-padding--top u-no-padding--bottom">
          <ExpiryNotification
            className="u-no-margin--bottom"
            size={ExpiryNotificationSize.Small}
            statuses={subscription.statuses}
          />
        </div>
        <hr />
      </>
    );
  }
  return (
    <Card
      className={classNames("p-subscriptions__list-card u-no-padding", {
        "is-active": isSelected,
      })}
      {...makeInteractiveProps(onClick)}
    >
      {expiryNotification}
      <div
        className={classNames("p-card__inner", {
          "u-no-padding--top": hasExpiryNotification,
        })}
        data-test="subscription-card-content"
      >
        <div className="p-subscriptions__list-card-title">
          <h5
            className="u-no-padding--top u-no-margin--bottom"
            data-test="card-title"
          >
            {isFree ? "Free Personal Token" : subscription.product_name}
          </h5>
          {subscription.type === UserSubscriptionType.Legacy ? null : (
            <span
              className="p-text--x-small-capitalised u-text--muted p-subscriptions__list-card-period"
              data-test="card-type"
            >
              {subscription.type}
            </span>
          )}
        </div>
        <Row>
          <Col medium={3} size={3} small={1}>
            <p className="u-text--muted u-no-margin--bottom">
              {isBlender ? "Users" : "Machines"}
            </p>
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
        {getFeaturesDisplay(subscription.entitlements).included.length > 0 ? (
          <List
            className="p-subscriptions__list-card-features p-text--x-small-capitalised u-text--muted u-no-margin--bottom"
            data-test="card-entitlements"
            inline
            items={getFeaturesDisplay(subscription.entitlements).included}
          />
        ) : null}
      </div>
    </Card>
  );
};

export default ListCard;
