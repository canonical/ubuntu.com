import { Button } from "@canonical/react-components";
import React, { useState } from "react";

import DetailsContent from "./DetailsContent";
import SubscriptionEdit from "../SubscriptionEdit";

const SubscriptionDetails = () => {
  const [editing, setEditing] = useState(false);
  return (
    <div className="p-subscriptions__details">
      <h4>UA Infra Essential (Virtual)</h4>
      <div className="u-sv4">
        <Button
          appearance="positive"
          className="u-no-margin--bottom"
          data-test="cancel-button"
          disabled={editing}
          element="a"
          href="https://support.canonical.com/"
        >
          Support portal
        </Button>
        <Button
          appearance="neutral"
          className="u-no-margin--bottom"
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
    </div>
  );
};

export default SubscriptionDetails;
