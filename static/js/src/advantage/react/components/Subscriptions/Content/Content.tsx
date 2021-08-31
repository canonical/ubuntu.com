import { Card } from "@canonical/react-components";
import { useScrollIntoView } from "advantage/react/hooks/useScrollIntoView";
import React, { useCallback, useEffect, useState } from "react";

import SubscriptionDetails from "../SubscriptionDetails";
import SubscriptionList from "../SubscriptionList";
import { SelectedToken } from "./types";

const Content = () => {
  const [modalActive, setModalActive] = useState(false);
  const [selectedToken, setSelectedToken] = useState<SelectedToken>(null);
  const [scrollTargetRef, scrollIntoView] = useScrollIntoView<HTMLDivElement>(
    20
  );
  const onSetActive = useCallback(
    (token: SelectedToken) => {
      // Only set the token if it has changed to another token. The selected
      // token is always needed for large screens.
      if (token) {
        setSelectedToken(token);
        scrollIntoView();
      }
      setModalActive(!!token);
    },
    [setSelectedToken]
  );

  // Select a token on the first load.
  useEffect(() => {
    if (!selectedToken) {
      // TODO: this should select the "most recently-started" or free token by default:
      // https://github.com/canonical-web-and-design/commercial-squad/issues/101
      // This only sets the selected token and does not set the modal to active
      // to prevent the modal appearing on first load on mobile.
      setSelectedToken("ua-sub-123");
    }
  }, [selectedToken, setSelectedToken]);

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
        ref={scrollTargetRef}
      />
    </Card>
  );
};

export default Content;
