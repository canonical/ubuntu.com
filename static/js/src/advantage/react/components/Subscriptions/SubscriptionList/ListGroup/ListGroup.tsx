import { ContextualMenu } from "@canonical/react-components";
import React from "react";
import type { ReactNode } from "react";

type Props = {
  children: ReactNode;
  title: string;
};

const ListGroup = ({ children, title }: Props): JSX.Element => (
  <div className="p-subscriptions__list-group">
    <div className="p-subscriptions__list-group-title">
      <span className="p-text--x-small-capitalised u-align-text--small-to-default u-no-margin--bottom">
        {title}
      </span>
      <ContextualMenu
        hasToggleIcon
        links={[]}
        toggleClassName="is-dense u-no-margin--bottom"
        toggleLabel="Renewal settings"
      />
    </div>
    {children}
  </div>
);

export default ListGroup;
