import { Button, Spinner } from "@canonical/react-components";
import React, { useState } from "react";
import classNames from "classnames";

import DetailsContent from "./DetailsContent";
import SubscriptionEdit from "../SubscriptionEdit";
import { useUserSubscriptions } from "advantage/react/hooks";
import { UserSubscriptionType } from "advantage/api/types";
import { selectFreeSubscription } from "advantage/react/hooks/useUserSubscriptions";

type Props = {
  modalActive?: boolean;
  onCloseModal: () => void;
};

const SubscriptionDetails = ({ modalActive, onCloseModal }: Props) => {
  const [editing, setEditing] = useState(false);
  const { data: subscription, isLoading } = useUserSubscriptions({
    // TODO: Get the selected subscription once the subscription token is available.
    select: selectFreeSubscription,
  });
  const isFreeSubscription = subscription?.type === UserSubscriptionType.Free;
  if (isLoading || !subscription) {
    return <Spinner />;
  }
  return (
    <div
      className={classNames("p-modal p-subscriptions__details", {
        "is-active": modalActive,
      })}
    >
      <section className="p-modal__dialog">
        <header className="p-modal__header">
          <h2 className="p-modal__title">
            {isFreeSubscription
              ? "Free Personal Token"
              : subscription.product_name}
          </h2>
          <button className="p-modal__close" onClick={() => onCloseModal()}>
            Close
          </button>
        </header>
        {isFreeSubscription ? null : (
          <div className="u-sv2">
            <Button
              appearance="positive"
              className="u-no-margin--bottom"
              data-test="support-button"
              disabled={editing}
              element="a"
              href="https://support.canonical.com/"
            >
              Support portal
            </Button>
            <Button
              appearance="neutral"
              data-test="edit-button"
              disabled={editing}
              onClick={() => setEditing(true)}
            >
              Edit subscription&hellip;
            </Button>
          </div>
        )}
        {editing ? (
          <SubscriptionEdit onClose={() => setEditing(false)} />
        ) : (
          <DetailsContent />
        )}
      </section>
    </div>
  );
};

export default SubscriptionDetails;
