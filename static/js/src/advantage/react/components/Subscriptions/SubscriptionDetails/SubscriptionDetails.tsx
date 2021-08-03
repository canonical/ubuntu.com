import { Button } from "@canonical/react-components";
import React from "react";

import DetailsContent from "./DetailsTabs";

const SubscriptionDetails = () => {
  return (
    <div className="p-subscribe__details">
      <h4>UA Infra Essential (Virtual)</h4>
      <div className="u-sv4">
        <Button
          appearance="positive"
          className="u-no-margin--bottom"
          element="a"
          href="https://support.canonical.com/"
        >
          Support portal
        </Button>
        <Button appearance="neutral" className="u-no-margin--bottom">
          Edit subscription&hellip;
        </Button>
      </div>
      <DetailsContent />
    </div>
  );
};

export default SubscriptionDetails;
