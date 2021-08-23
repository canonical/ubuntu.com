import { Button } from "@canonical/react-components";
import React, { useState } from "react";
import classNames from "classnames";

import DetailsContent from "./DetailsContent";
import SubscriptionEdit from "../SubscriptionEdit";

type Props = {
  modalActive?: boolean;
  onCloseModal: () => void;
};

const SubscriptionDetails = ({ modalActive, onCloseModal }: Props) => {
  const [editing, setEditing] = useState(false);
  return (
    <div
      className={classNames("p-modal p-subscriptions__details", {
        "is-active": modalActive,
      })}
    >
      <section className="p-modal__dialog">
        <header className="p-modal__header">
          <h2 className="p-modal__title">UA Infra Essential (Virtual)</h2>
          <button className="p-modal__close" onClick={() => onCloseModal()}>
            Close
          </button>
        </header>
        <div className="u-sv2">
          <Button
            appearance="positive"
            data-test="cancel-button"
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
