import { Card, Col, List, Row } from "@canonical/react-components";
import React from "react";
import { format, parseJSON } from "date-fns";

type Props = {
  created: string;
  expires?: string | null;
  features: string[];
  machines: number;
  label: string;
  title: string;
};

const DATE_FORMAT = "dd.MM.yyyy";

const formatDate = (date: string) => {
  try {
    return format(parseJSON(date), DATE_FORMAT);
  } catch (error) {
    return date;
  }
};

const ListCard = ({
  created,
  expires,
  features,
  machines,
  label,
  title,
}: Props): JSX.Element => (
  <Card>
    <div className="p-subscriptions__list-card-title">
      <h5 className="u-no-padding--top u-no-margin--bottom">{title}</h5>
      <span className="p-text--x-small-capitalised u-text--muted p-subscriptions__list-card-period">
        {label}
      </span>
    </div>
    <Row>
      <Col size={3}>
        <p className="u-text--muted u-no-margin--bottom">Machines</p>
        {machines}
      </Col>
      <Col size={4}>
        <p className="u-text--muted u-no-margin--bottom">Created</p>
        {formatDate(created)}
      </Col>
      <Col size={4}>
        <p className="u-text--muted u-no-margin--bottom">Expires</p>
        {expires ? formatDate(expires) : "Never"}
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
