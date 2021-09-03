import { Spinner } from "@canonical/react-components";
import { useUserSubscriptions } from "advantage/react/hooks";
import {
  selectFreeSubscription,
  selectUASubscriptions,
} from "advantage/react/hooks/useUserSubscriptions";
import React from "react";
import { SelectedToken } from "../Content/types";

import ListCard from "./ListCard";
import ListGroup from "./ListGroup";

type Props = {
  selectedToken?: SelectedToken;
  onSetActive: (token: SelectedToken) => void;
};

const SubscriptionList = ({ selectedToken, onSetActive }: Props) => {
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
  const uaSubscriptions = uaSubscriptionsData.map((subscription, i) => (
    <ListCard
      data-test="ua-subscription"
      isSelected={selectedToken === `ua-sub-${i}`}
      key={i}
      onClick={() => {
        // TODO: update this to use the sub token when it is available.
        // https://github.com/canonical-web-and-design/commercial-squad/issues/210
        onSetActive(`ua-sub-${i}`);
      }}
      subscription={subscription}
    />
  ));

  return (
    <div className="p-subscriptions__list">
      <div className="p-subscriptions__list-scroll">
        <ListGroup title="Ubuntu Advantage">{uaSubscriptions}</ListGroup>
        {freeSubscription ? (
          <ListGroup title="Free personal token">
            <ListCard
              data-test="free-subscription"
              isSelected={
                // TODO: update this to use the sub token when it is available.
                // https://github.com/canonical-web-and-design/commercial-squad/issues/210
                selectedToken === "free-subscription"
              }
              onClick={() => {
                // TODO: update this to use the sub token when it is available.
                // https://github.com/canonical-web-and-design/commercial-squad/issues/210
                onSetActive("free-subscription");
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
