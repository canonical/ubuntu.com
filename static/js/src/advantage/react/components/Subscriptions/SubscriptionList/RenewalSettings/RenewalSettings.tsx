import { ContextualMenu } from "@canonical/react-components";
import React, { RefObject, useState } from "react";
import { Formik } from "formik";

import RenewalSettingsFields from "./RenewalSettingsFields";
import { sendAnalyticsEvent } from "advantage/react/utils/sendAnalyticsEvent";

type Props = {
  positionNodeRef: RefObject<HTMLDivElement>;
};

const RenewalSettings = ({ positionNodeRef }: Props): JSX.Element => {
  const [menuOpen, setMenuOpen] = useState<boolean>(false);
  return (
    <ContextualMenu
      constrainPanelWidth
      dropdownClassName="p-subscription__renewal-dropdown"
      hasToggleIcon
      onToggleMenu={(isOpen) => {
        setMenuOpen(isOpen);
        sendAnalyticsEvent({
          eventCategory: "Advantage",
          eventAction: "subscription-auto-renewal-form",
          eventLabel: `auto renewal dropdown ${isOpen ? "opened" : "closed"}`,
        });
      }}
      position="left"
      positionNode={positionNodeRef.current}
      toggleClassName="is-dense u-no-margin--bottom"
      toggleLabel="Renewal settings"
      visible={menuOpen}
    >
      <p className="u-no-padding--top u-no-margin--bottom u-sv1">
        <strong>
          2 monthly subscriptions are affected by auto-renew settings.
        </strong>
      </p>
      <hr />
      <p className="u-no-margin--bottom u-sv1">
        Your next recurring payment of <strong>$30.00</strong> will be taken on{" "}
        <strong>17 July 2021</strong>.
      </p>
      <Formik
        initialValues={{
          // TODO: use the initial value from the subscription.
          should_auto_renew: false,
        }}
        onSubmit={({ should_auto_renew }) => {
          // TODO: Implement updating the renewal settings:
          // https://github.com/canonical-web-and-design/commercial-squad/issues/99
          sendAnalyticsEvent({
            eventCategory: "Advantage",
            eventAction: "subscription-auto-renewal-form",
            eventLabel: `auto renewal ${
              should_auto_renew ? "enabled" : "disabled"
            }`,
          });
        }}
      >
        <RenewalSettingsFields setMenuOpen={setMenuOpen} />
      </Formik>
    </ContextualMenu>
  );
};

export default RenewalSettings;
