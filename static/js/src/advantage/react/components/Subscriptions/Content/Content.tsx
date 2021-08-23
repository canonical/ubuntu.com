import { Card } from "@canonical/react-components";
import React, { useCallback, useState } from "react";

import SubscriptionDetails from "../SubscriptionDetails";
import SubscriptionList from "../SubscriptionList";
import { SelectedToken } from "./types";

const Content = () => {
  const [modalActive, setModalActive] = useState(false);
  const [selectedToken, setSelectedToken] = useState<SelectedToken>(null);
  const onSetActive = useCallback(
    (token: SelectedToken) => {
      // Only set the token if it has changed to another token. The selected
      // token is always needed for large screens.
      if (token) {
        setSelectedToken(token);
      }
      setModalActive(!!token);
    },
    [setSelectedToken]
  );
  return (
    <Card className="u-no-margin--bottom u-no-padding p-subscriptions__card">
      <SubscriptionList
        selectedToken={selectedToken}
        onSetActive={onSetActive}
      />
      <SubscriptionDetails
        modalActive={modalActive}
        onCloseModal={() => {
          onSetActive(null);
        }}
      />
    </Card>
  );
};

export default Content;
