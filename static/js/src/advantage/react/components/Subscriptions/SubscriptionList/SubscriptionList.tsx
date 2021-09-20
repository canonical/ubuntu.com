import { Spinner } from "@canonical/react-components";
import { UserSubscription } from "advantage/api/types";
import { useUserSubscriptions } from "advantage/react/hooks";
import {
  selectFreeSubscription,
  selectUASubscriptions,
} from "advantage/react/hooks/useUserSubscriptions";
import { parseJSON } from "date-fns";
import React from "react";
import { SelectedId } from "../Content/types";

import ListCard from "./ListCard";
import ListGroup from "./ListGroup";

type Props = {
  selectedId?: SelectedId;
  onSetActive: (token: SelectedId) => void;
};

const sortSubscriptions = (subscriptions: UserSubscription[]) =>
  subscriptions.sort(
    (a, b) =>
      parseJSON(b.start_date).getTime() - parseJSON(a.start_date).getTime()
  );

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
  if (isLoadingFree || isLoadingUA) {
    return <Spinner />;
  }
  // Sort the subscriptions so that the most recently started subscription is first.
  const sortedUASubscriptions = sortSubscriptions(uaSubscriptionsData);
  const uaSubscriptions = sortedUASubscriptions.map((subscription, i) => (
    <ListCard
      data-test="ua-subscription"
      isSelected={selectedId === subscription.id}
      key={i}
      onClick={() => {
        onSetActive(subscription.id);
      }}
      subscription={subscription}
    />
  ));

  return (
    <div className="p-subscriptions__list">
      <div className="p-subscriptions__list-scroll">
        <ListGroup title="Ubuntu Advantage">{uaSubscriptions}</ListGroup>
        {freeSubscription ? (
          <ListGroup title="Free personal token" showRenewalSettings={false}>
            <ListCard
              data-test="free-subscription"
              isSelected={selectedId === freeSubscription.id}
              onClick={() => {
                onSetActive(freeSubscription.id);
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
