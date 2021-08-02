import { Card, Col, List, Row } from "@canonical/react-components";
import React from "react";

type Props = {
  created: string;
  expires: string;
  features: string[];
  machines: number;
  period: string;
  title: string;
};

const ListCard = ({
  created,
  expires,
  features,
  machines,
  period,
  title,
}: Props): JSX.Element => (
  <Card>
    <div className="p-subscriptions__list-card-title">
      <h5 className="u-no-padding--top u-no-margin--bottom">{title}</h5>
      <span className="p-text--x-small-capitalised u-text--muted p-subscriptions__list-card-period">
        {period}
      </span>
    </div>
    <Row>
      <Col size={3}>
        <p className="u-text--muted u-no-margin--bottom">Machines</p>
        {machines}
      </Col>
      <Col size={4}>
        <p className="u-text--muted u-no-margin--bottom">Created</p>
        {created}
      </Col>
      <Col size={4}>
        <p className="u-text--muted u-no-margin--bottom">Expires</p>
        {expires}
      </Col>
    </Row>
    <List
      className="p-subscriptions__list-card-features p-text--x-small-capitalised u-text--muted u-no-margin--bottom"
      inline
      items={features}
    />
  </Card>
);

export default ListCard;
