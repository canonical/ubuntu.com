import { Spinner } from "@canonical/react-components";
import { useUserSubscriptions } from "advantage/react/hooks";
import {
  selectFreeSubscription,
  selectUASubscriptions,
} from "advantage/react/hooks/useUserSubscriptions";
import { sortSubscriptionsByStartDate } from "advantage/react/utils";
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
  if (isLoadingFree || isLoadingUA) {
    return <Spinner />;
  }
  // Sort the subscriptions so that the most recently started subscription is first.
  const sortedUASubscriptions = sortSubscriptionsByStartDate(
    uaSubscriptionsData
  );
  const uaSubscriptions = sortedUASubscriptions.map((subscription, i) => (
    <ListCard
      data-test="ua-subscription"
      isSelected={selectedId === subscription.contract_id}
      key={i}
      onClick={() => {
        onSetActive(subscription.contract_id);
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
              isSelected={selectedId === freeSubscription.contract_id}
              onClick={() => {
                onSetActive(freeSubscription.contract_id);
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
