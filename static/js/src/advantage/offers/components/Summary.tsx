import React from "react";
import { Row, Col } from "@canonical/react-components";
import { currencyFormatter } from "../../react/utils";
import { Offer as OfferType, Item } from "../types";

type SummaryProps = {
  offer: OfferType;
};

const Summary = ({ offer }: SummaryProps) => {
  const { items, total } = offer;

  return (
    <>
      <Row>
        <Col size={4}>
          <p className="u-text-light">Products:</p>
        </Col>
        <Col size={8}>
          {items.map((item: Item) => {
            return (
              <Row key={item.id}>
                <p>
                  {item.allowance ?? 0} x {item.name}
                </p>
              </Row>
            );
          })}
        </Col>
      </Row>
      <Row>
        <Col size={4}>
          <p className="u-text-light">Total before taxes:</p>
        </Col>
        <Col size={8}>
          <p>{currencyFormatter.format(total / 100)}</p>
        </Col>
      </Row>
    </>
  );
};

export default Summary;
