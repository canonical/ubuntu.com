import { Spinner } from "@canonical/react-components";
import { UserSubscriptionMarketplace } from "advantage/api/enum";
import { useUserSubscriptions } from "advantage/react/hooks";
import {
  selectFreeSubscription,
  selectUASubscriptions,
  selectBlenderSubscriptions,
} from "advantage/react/hooks/useUserSubscriptions";
import { sortSubscriptionsByStartDate } from "advantage/react/utils";
import { sendAnalyticsEvent } from "advantage/react/utils/sendAnalyticsEvent";
import React from "react";
import { SelectedId } from "../Content/types";

import ListCard from "./ListCard";
import ListGroup from "./ListGroup";
import { UserSubscription } from "advantage/api/types";

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
  const {
    data: blenderSubscriptionsData = [],
    isLoading: isLoadingBlender,
  } = useUserSubscriptions({
    select: selectBlenderSubscriptions,
  });

  if (isLoadingFree || isLoadingUA || isLoadingBlender) {
    return <Spinner />;
  }
  // Sort the subscriptions so that the most recently started subscription is first.
  const sortedUASubscriptions = sortSubscriptionsByStartDate(
    uaSubscriptionsData
  );
  const uaSubscriptions = sortedUASubscriptions.map((subscription) => (
    <ListCard
      data-test="ua-subscription"
      isSelected={selectedId === subscription.id}
      key={subscription.id}
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

  const sortedBlenderSubscriptions = sortSubscriptionsByStartDate(
    blenderSubscriptionsData
  );

  const blenderSubscriptions = sortedBlenderSubscriptions.map(
    (subscription) => (
      <ListCard
        data-test="blender-subscription"
        isSelected={selectedId === subscription.id}
        key={subscription.id}
        onClick={() => {
          sendAnalyticsEvent({
            eventCategory: "Advantage",
            eventAction: "subscription-change",
            eventLabel: "blender subscription clicked",
          });
          onSetActive(subscription.id);
        }}
        subscription={subscription}
      />
    )
  );

  const checkActiveSubscription = (subscriptions: UserSubscription[]) => {
    let activeSubscription = false;
    subscriptions?.length > 0 &&
      subscriptions?.forEach((subscription) => {
        if (subscription?.statuses?.is_subscription_active == true) {
          activeSubscription = true;
        }
      });
    return activeSubscription;
  };

  const showFreeSubscription =
    !checkActiveSubscription(sortedUASubscriptions) &&
    !checkActiveSubscription(sortedBlenderSubscriptions);

  return (
    <div className="p-subscriptions__list p-card" style={{ overflow: "unset" }}>
      {sortedUASubscriptions.length ? (
        <ListGroup
          data-test="ua-subscriptions-group"
          title="Ubuntu Pro"
          marketplace={UserSubscriptionMarketplace.CanonicalUA}
        >
          {uaSubscriptions}
        </ListGroup>
      ) : null}

      {sortedBlenderSubscriptions.length ? (
        <ListGroup
          data-test="blender-subscriptions-group"
          title="Blender"
          marketplace={UserSubscriptionMarketplace.Blender}
        >
          {blenderSubscriptions}
        </ListGroup>
      ) : null}

      {freeSubscription && showFreeSubscription ? (
        <ListGroup
          title="Free personal token"
          marketplace={UserSubscriptionMarketplace.Free}
        >
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
  );
};

export default SubscriptionList;
