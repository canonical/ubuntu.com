import { Card } from "@canonical/react-components";
import React from "react";

import SubscriptionDetails from "../SubscriptionDetails";
import SubscriptionList from "../SubscriptionList";

const Content = () => (
  <Card className="u-no-margin--bottom u-no-padding p-subscriptions__card">
    <SubscriptionList />
    <SubscriptionDetails />
  </Card>
);

export default Content;
