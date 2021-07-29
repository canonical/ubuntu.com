import { Card, Col, Row } from "@canonical/react-components";
import React from "react";

const Content = () => (
  <Card className="u-no-margin--bottom">
    <Row className="">
      <Col size={5} data-test="subscription-list">
        Subscription list
      </Col>
      <Col size={7} data-test="subscription-details">
        Subscription details
      </Col>
    </Row>
  </Card>
);

export default Content;
