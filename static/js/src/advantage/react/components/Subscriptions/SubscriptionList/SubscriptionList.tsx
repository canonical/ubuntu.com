import { Spinner } from "@canonical/react-components";
import { useUserInfo, useUserSubscriptions } from "advantage/react/hooks";
import {
  selectFreeSubscription,
  selectUASubscriptions,
} from "advantage/react/hooks/useUserSubscriptions";
import { sortSubscriptionsByStartDate } from "advantage/react/utils";
import { sendAnalyticsEvent } from "advantage/react/utils/sendAnalyticsEvent";
import React from "react";
import { SelectedId } from "../Content/types";

import ListCard from "./ListCard";
import ListGroup from "./ListGroup";

type Props = {
  selectedId?: SelectedId;
  onSetActive: (token: SelectedId) => void;
};

const SubscriptionList = ({ selectedId, onSetActive }: Props) => {
  const {
    data: freeSubscription,
    isLoading: isLoadingFree,
  } = useUserSubscriptions({
    select: selectFreeSubscription,
  });
  const {
    data: uaSubscriptionsData = [],
    isLoading: isLoadingUA,
  } = useUserSubscriptions({
    select: selectUASubscriptions,
  });
  const { data: userInfo, isLoading: isLoadingUserInfo } = useUserInfo();
  if (isLoadingFree || isLoadingUA || isLoadingUserInfo) {
    return <Spinner />;
  }
  // Sort the subscriptions so that the most recently started subscription is first.
  const sortedUASubscriptions = sortSubscriptionsByStartDate(
    uaSubscriptionsData
  );
  const uaSubscriptions = sortedUASubscriptions.map((subscription, i) => (
    <ListCard
      data-test="ua-subscription"
      isSelected={selectedId === subscription.id}
      key={i}
      onClick={() => {
        sendAnalyticsEvent({
          eventCategory: "Advantage",
          eventAction: "subscription-change",
          eventLabel: "ua subscription clicked",
        });
        onSetActive(subscription.id);
      }}
      subscription={subscription}
    />
  ));

  return (
    <div className="p-subscriptions__list">
      <div className="p-subscriptions__list-scroll">
        <ListGroup
          title="Ubuntu Advantage"
          showRenewalSettings={userInfo?.has_monthly_subscription}
        >
          {uaSubscriptions}
        </ListGroup>
        {freeSubscription ? (
          <ListGroup title="Free personal token" showRenewalSettings={false}>
            <ListCard
              data-test="free-subscription"
              isSelected={selectedId === freeSubscription.id}
              onClick={() => {
                onSetActive(freeSubscription.id);
                sendAnalyticsEvent({
                  eventCategory: "Advantage",
                  eventAction: "subscription-change",
                  eventLabel: "free subscription clicked",
                });
              }}
              subscription={freeSubscription}
            />
          </ListGroup>
        ) : null}
      </div>
    </div>
  );
};

export default SubscriptionList;
