import {
  Card,
  Notification,
  NotificationSeverity,
  Spinner,
} from "@canonical/react-components";
import {
  UserSubscriptionMarketplace,
  UserSubscriptionPeriod,
} from "advantage/api/enum";
import { useUserSubscriptions } from "advantage/react/hooks";
import { useScrollIntoView } from "advantage/react/hooks/useScrollIntoView";
import { sortSubscriptionsByStartDate } from "advantage/react/utils";
import React, { useCallback, useEffect, useState } from "react";

import ReBuyExpiredModal from "../ReBuyExpired";
import SubscriptionDetails from "../SubscriptionDetails";
import SubscriptionList from "../SubscriptionList";
import { SelectedId } from "./types";

const Content = () => {
  const [modalActive, setModalActive] = useState(false);
  const [selectedId, setSelectedId] = useState<SelectedId>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [scrollTargetRef, scrollIntoView] = useScrollIntoView<HTMLDivElement>(
    20
  );

  const { data: allSubscriptions, isError, isLoading } = useUserSubscriptions();
  const onSetActive = useCallback(
    (token: SelectedId) => {
      // Only set the token if it has changed to another token. The selected
      // token is always needed for large screens.
      if (hasUnsavedChanges) {
        if (
          window.confirm(
            "You have unsaved changes. Are you sure you want to leave?"
          )
        ) {
          // User asked to leave the page
          if (token) {
            setSelectedId(token);
            scrollIntoView();
          }
        }
      }
      if (token && !hasUnsavedChanges) {
        setSelectedId(token);
        scrollIntoView();
      }
      setModalActive(!!token);
    },
    [setSelectedId, hasUnsavedChanges]
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

  const [showRepurchase, setShowRepurchase] = useState(false);
  useEffect(() => {
    if (location.hash.startsWith("#repurchase,")) {
      setShowRepurchase(true);
    }
  }, []);

  if (showRepurchase) {
    const [
      accountId,
      listingId,
      units,
      period,
      marketplace,
      total,
      productName,
    ] = location.hash.split(",").slice(1);
    return (
      <ReBuyExpiredModal
        repurchase={{
          accountId: accountId,
          listingId: listingId,
          units: parseInt(units),
          period: period as UserSubscriptionPeriod,
          marketplace: marketplace as UserSubscriptionMarketplace,
          total: parseInt(total),
          productName: decodeURI(productName),
        }}
        closeModal={() => {
          setShowRepurchase(false);
        }}
      />
    );
  }

  if (isLoading) {
    return (
      <Card className="u-no-margin--bottom" data-test="initial-load">
        <Spinner /> Loading&hellip;
      </Card>
    );
  }
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
    <Card
      className="u-no-margin--bottom u-no-padding p-subscriptions__card"
      style={{ overflow: "unset" }}
    >
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
        setHasUnsavedChanges={setHasUnsavedChanges}
      />
    </Card>
  );
};

export default Content;
