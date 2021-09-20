import { Card, Spinner } from "@canonical/react-components";
import { UserSubscriptionMarketplace } from "advantage/api/enum";
import { useUserSubscriptions } from "advantage/react/hooks";
import { useScrollIntoView } from "advantage/react/hooks/useScrollIntoView";
import { sortSubscriptionsByStartDate } from "advantage/react/utils";
import React, { useCallback, useEffect, useState } from "react";

import SubscriptionDetails from "../SubscriptionDetails";
import SubscriptionList from "../SubscriptionList";
import { SelectedId } from "./types";

const Content = () => {
  const [modalActive, setModalActive] = useState(false);
  const [selectedId, setSelectedId] = useState<SelectedId>(null);
  const [scrollTargetRef, scrollIntoView] = useScrollIntoView<HTMLDivElement>(
    20
  );
  const { data: allSubscriptions, isLoading } = useUserSubscriptions();
  const onSetActive = useCallback(
    (token: SelectedId) => {
      // Only set the token if it has changed to another token. The selected
      // token is always needed for large screens.
      if (token) {
        setSelectedId(token);
        scrollIntoView();
      }
      setModalActive(!!token);
    },
    [setSelectedId]
  );

  // Select a token on the first load.
  useEffect(() => {
    if (!selectedId && !isLoading && allSubscriptions?.length) {
      const sortedSubscriptions = sortSubscriptionsByStartDate(
        allSubscriptions
      );
      // Get the first UA subscription, or if there are none then get the first
      // available.
      const firstSubscription =
        sortedSubscriptions.find(
          ({ marketplace }) =>
            marketplace === UserSubscriptionMarketplace.CanonicalUA
        ) || sortedSubscriptions[0];
      // This only sets the selected token and does not set the modal to active
      // to prevent the modal appearing on first load on mobile.
      setSelectedId(firstSubscription.id);
    }
  }, [selectedId, setSelectedId, allSubscriptions, isLoading]);

  if (isLoading) {
    return (
      <Card className="u-no-margin--bottom" data-test="initial-load">
        <Spinner /> Loading&hellip;
      </Card>
    );
  }

  return (
    <Card className="u-no-margin--bottom u-no-padding p-subscriptions__card">
      <SubscriptionList selectedId={selectedId} onSetActive={onSetActive} />
      <SubscriptionDetails
        // Give the component a key so that the internal state gets reset when
        // changing subscriptions. This is to prevent displaying notifications,
        // showing the cancel form or retaining other state that should not be
        // kept when clicking on a different subscription.
        key={selectedId}
        modalActive={modalActive}
        onCloseModal={() => {
          onSetActive(null);
        }}
        ref={scrollTargetRef}
        selectedId={selectedId}
      />
    </Card>
  );
};

export default Content;
