import { Card } from "@canonical/react-components";
import React, { useState } from "react";

import SubscriptionDetails from "../SubscriptionDetails";
import SubscriptionList from "../SubscriptionList";
import { SelectedToken } from "./types";

const Content = () => {
  const [selectedToken, setSelectedToken] = useState<SelectedToken>(null);
  return (
    <Card className="u-no-margin--bottom u-no-padding p-subscriptions__card">
      <SubscriptionList
        selectedToken={selectedToken}
        setSelectedToken={setSelectedToken}
      />
      <SubscriptionDetails />
    </Card>
  );
};

export default Content;
