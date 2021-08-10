import React, { useRef, useState } from "react";
import type { ReactNode } from "react";

import RenewalSettings from "../RenewalSettings";

type Props = {
  children: ReactNode;
  title: string;
};

const ListGroup = ({ children, title }: Props): JSX.Element => {
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
        <span className="p-text--x-small-capitalised u-align-text--small-to-default u-no-margin--bottom">
          {title}
        </span>
        <RenewalSettings positionNodeRef={positionNode} />
      </div>
      {children}
    </div>
  );
};

export default ListGroup;
