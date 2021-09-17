import {
  Card,
  Notification,
  NotificationSeverity,
} from "@canonical/react-components";
import { useUserSubscriptions } from "advantage/react/hooks";
import { useScrollIntoView } from "advantage/react/hooks/useScrollIntoView";
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
  const { data: allSubscriptions, isError, isLoading } = useUserSubscriptions();
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
      // TODO: this should select the "most recently-started" or free token by default:
      // https://github.com/canonical-web-and-design/commercial-squad/issues/101
      // This only sets the selected token and does not set the modal to active
      // to prevent the modal appearing on first load on mobile.
      setSelectedId(allSubscriptions[0].contract_id);
    }
  }, [selectedId, setSelectedId, allSubscriptions, isLoading]);

  if (isError) {
    return (
      <Notification
        data-test="loading-error"
        severity={NotificationSeverity.NEGATIVE}
        title="Loading failed:"
      >
        Your subscriptions could not be loaded. Please refresh the page or try
        again later.
      </Notification>
    );
  }

  return (
    <Card className="u-no-margin--bottom u-no-padding p-subscriptions__card">
      <SubscriptionList selectedId={selectedId} onSetActive={onSetActive} />
      <SubscriptionDetails
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
