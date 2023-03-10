import React, { useRef, useState } from "react";
import type { ReactNode } from "react";
import { selectAutoRenewableSubscriptionsByMarketplace } from "advantage/react/hooks/useUserSubscriptions";
import { useUserSubscriptions } from "advantage/react/hooks";

import RenewalSettings from "../RenewalSettings";
import { UserSubscriptionMarketplace } from "advantage/api/enum";

type Props = {
  children: ReactNode;
  title: string;
  marketplace: UserSubscriptionMarketplace;
};

const ListGroup = ({ children, title, marketplace }: Props): JSX.Element => {
  const { data: renewableSubscriptions } = useUserSubscriptions({
    select: selectAutoRenewableSubscriptionsByMarketplace(marketplace),
  });

  const positionNode = useRef<HTMLDivElement | null>(null);
  const [, setRefReady] = useState(false);
  return (
    <div className="p-subscriptions__list-group">
      <div
        className="p-subscriptions__list-group-title"
        ref={(element) => {
          positionNode.current = element;
          // Fire state change so that the menu rerenders now that the ref
          // exists in the DOM.
          setRefReady(true);
        }}
      >
        <span className="p-text--small-caps u-align-text--small-to-default u-no-margin--bottom">
          {title}
        </span>
        {renewableSubscriptions?.length ?? 0 > 0 ? (
          <RenewalSettings
            positionNodeRef={positionNode}
            marketplace={marketplace}
          />
        ) : null}
      </div>
      {children}
    </div>
  );
};

export default ListGroup;
