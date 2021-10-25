import React from "react";
import { Row, Col } from "@canonical/react-components";
import { format } from "date-fns";
import { formatter } from "../../../../../subscribe/renderers/form-renderer";
import { UserSubscription } from "../../../../../api/types";

const DATE_FORMAT = "dd MMMM yyyy";

type Props = {
  productName: UserSubscription["product_name"];
  quantity: UserSubscription["number_of_machines"];
  startDate: Date;
  endDate: Date;
  total: UserSubscription["price"];
};

function Summary({ productName, quantity, startDate, endDate, total }: Props) {
  return (
    <section
      id="summary-section"
      className="p-strip is-shallow u-no-padding--top"
    >
      <Row className="u-no-padding u-sv1">
        <Col size={4}>
          <div className="u-text-light">Plan type:</div>
        </Col>
        <Col size={8}>
          <div data-test="name">{productName}</div>
        </Col>
      </Row>
      <Row className="u-no-padding u-sv1">
        <Col size={4}>
          <div className="u-text-light">Machines:</div>
        </Col>
        <Col size={8}>
          <div data-test="machines">
            {quantity} x {formatter.format((total ?? 0) / quantity / 100)}
          </div>
        </Col>
      </Row>
      <Row className="u-no-padding u-sv1">
        <Col size={4}>
          <div className="u-text-light">Continues from:</div>
        </Col>
        <Col size={8}>
          <div data-test="start-date">{format(startDate, DATE_FORMAT)}</div>
        </Col>
      </Row>
      <Row className="u-no-padding u-sv1">
        <Col size={4}>
          <div className="u-text-light">Ends:</div>
        </Col>

        <Col size={8}>
          <div data-test="end-date">{format(endDate, DATE_FORMAT)}</div>
        </Col>
      </Row>
      <Row className="u-no-padding u-sv1">
        <Col size={4}>
          <div className="u-text-light">Subtotal:</div>
        </Col>
        <Col size={8}>
          <div data-test="subtotal">{formatter.format((total ?? 0) / 100)}</div>
        </Col>
      </Row>
    </section>
  );
}

export default Summary;
