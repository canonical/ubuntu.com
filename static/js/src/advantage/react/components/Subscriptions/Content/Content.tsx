import { Card } from "@canonical/react-components";
import React, { useState } from "react";

import SubscriptionDetails from "../SubscriptionDetails";
import SubscriptionList from "../SubscriptionList";
import { SelectedToken } from "./types";

const Content = () => {
  // TODO: toggle the details modal visibility when the details are made to be
  // responsive:
  // https://github.com/canonical-web-and-design/commercial-squad/issues/111
  const [modalActive] = useState(false);
  const [selectedToken, setSelectedToken] = useState<SelectedToken>(null);
  return (
    <Card className="u-no-margin--bottom u-no-padding p-subscriptions__card">
      <SubscriptionList
        selectedToken={selectedToken}
        setSelectedToken={setSelectedToken}
      />
      <SubscriptionDetails modalActive={modalActive} />
    </Card>
  );
};

export default Content;
