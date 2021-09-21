import {
  ContextualMenu,
  Notification,
  NotificationSeverity,
  Spinner,
} from "@canonical/react-components";
import React, { ReactNode, RefObject, useState } from "react";
import { Formik } from "formik";

import RenewalSettingsFields from "./RenewalSettingsFields";
import { useUserInfo, useUserSubscriptions } from "advantage/react/hooks";
import { selectAutoRenewableUASubscriptions } from "advantage/react/hooks/useUserSubscriptions";
import { UserInfo } from "advantage/api/types";
import { formatDate } from "advantage/react/utils";

type Props = {
  positionNodeRef: RefObject<HTMLDivElement>;
};

const generatePrice = (userInfo: UserInfo): string => {
  const formatter = new Intl.NumberFormat("en-US", {
    currency: userInfo.currency,
    maximumFractionDigits: 2,
    minimumFractionDigits: 2,
    style: "currency",
  });
  // The total is in cents so it needs to be divided by 100.
  return formatter.format((userInfo.total || 0) / 100);
};

const RenewalSettings = ({ positionNodeRef }: Props): JSX.Element => {
  const [menuOpen, setMenuOpen] = useState<boolean>(false);
  const {
    data: userInfo,
    isError: isUserInfoError,
    isLoading: isLoadingUserInfo,
  } = useUserInfo();
  const {
    data: monthlySubscriptions,
    isError: isSubscriptionsError,
    isLoading: isLoadingSubscriptions,
  } = useUserSubscriptions({
    select: selectAutoRenewableUASubscriptions,
  });
  let content: ReactNode = null;
  if (isLoadingUserInfo || isLoadingSubscriptions) {
    content = <Spinner text="Loading..." />;
  } else if (isUserInfoError || !userInfo) {
    content = (
      <Notification
        data-test="user-info-loading-error"
        severity={NotificationSeverity.NEGATIVE}
      >
        There was a problem fetching your auto renewal settings. Please refresh
        the page or try again later.
      </Notification>
    );
  } else if (isSubscriptionsError || !monthlySubscriptions) {
    content = (
      <Notification
        data-test="subscriptions-loading-error"
        severity={NotificationSeverity.NEGATIVE}
      >
        There was a problem loading your subscription information. Please
        refresh the page or try again later.
      </Notification>
    );
  } else {
    content = (
      <>
        <p className="u-no-padding--top u-no-margin--bottom u-sv1">
          <strong data-test="subscription-count">
            {monthlySubscriptions.length} monthly subscription
            {monthlySubscriptions.length === 1 ? " is" : "s are"} affected by
            auto-renew settings.
          </strong>
        </p>
        <hr />
        {userInfo.next_payment_date ? (
          <p className="u-no-margin--bottom u-sv1" data-test="next-payment">
            Your next recurring payment of{" "}
            <strong data-test="monthly-price">{generatePrice(userInfo)}</strong>{" "}
            will be taken on{" "}
            <strong data-test="next-payment-date">
              {formatDate(userInfo.next_payment_date, "d MMMM yyyy")}
            </strong>
            .
          </p>
        ) : null}
        <Formik
          initialValues={{
            should_auto_renew: userInfo.is_auto_renewing,
          }}
          onSubmit={() => {
            // TODO: Implement updating the renewal settings:
            // https://github.com/canonical-web-and-design/commercial-squad/issues/99
          }}
        >
          <RenewalSettingsFields setMenuOpen={setMenuOpen} />
        </Formik>
      </>
    );
  }

  return (
    <ContextualMenu
      constrainPanelWidth
      dropdownClassName="p-subscription__renewal-dropdown"
      hasToggleIcon
      onToggleMenu={(isOpen) => setMenuOpen(isOpen)}
      position="left"
      positionNode={positionNodeRef.current}
      toggleClassName="is-dense u-no-margin--bottom"
      toggleLabel="Renewal settings"
      visible={menuOpen}
    >
      {content}
    </ContextualMenu>
  );
};

export default RenewalSettings;
