import { Card } from "@canonical/react-components";
import React from "react";
import { useMediaQuery } from "react-responsive";

import SubscriptionDetails from "../SubscriptionDetails";
import SubscriptionList from "../SubscriptionList";

enum Breakpoint {
  SMALL = "620px",
}

const Content = () => {
  const isSmallScreen = useMediaQuery({
    query: `(max-width: ${Breakpoint.SMALL})`,
  });
  return (
    <Card className="u-no-margin--bottom u-no-padding p-subscriptions__card">
      <SubscriptionList />
      {isSmallScreen ? null : <SubscriptionDetails />}
    </Card>
  );
};
export default Content;
