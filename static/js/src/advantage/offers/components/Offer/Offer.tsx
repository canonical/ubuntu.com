import React from "react";
import { ActionButton, Card, Row, Col } from "@canonical/react-components";
import { currencyFormatter } from "advantage/react/utils";
import { Offer as OfferType, Item } from "../../types";

type Props = {
  offer: OfferType;
};

const Offer = ({ offer }: Props) => {
  return (
    <Card data-testid="offer-card">
      <Row>
        <Col size={6}>
          <p className="p-text--x-small-capitalised">Contract item</p>
        </Col>
        <Col size={3}>
          <p className="p-text--x-small-capitalised">Allowance</p>
        </Col>
        <Col size={3}>
          <p className="p-text--x-small-capitalised">Price</p>
        </Col>
      </Row>
      <hr />
      {offer.items.map((item: Item) => {
        return (
          <Row key={item.id}>
            <Col size={6}>
              <p>
                <strong>{item.name}</strong>
              </p>
            </Col>
            <Col size={3}>
              <p>{item.allowance ?? 0}</p>
            </Col>
            <Col size={3}>
              <p>{currencyFormatter.format(item.price / 100)}</p>
            </Col>
          </Row>
        );
      })}
      <Row>
        <Col size={3} emptyLarge={7}>
          <p className="p-text--x-small-capitalised col-3 col-start-large-7">
            Total before taxes
          </p>
        </Col>
        <Col size={3}>
          <p className="col-3">{currencyFormatter.format(offer.total / 100)}</p>
        </Col>
      </Row>
      <Row>
        <Col size={12} className="u-align--right">
          <ActionButton
            appearance="positive"
            className="u-no-margin--bottom"
            onClick={() => {
              alert("nope.");
            }}
            disabled={!offer.actionable}
          >
            Purchase
          </ActionButton>
        </Col>
      </Row>
    </Card>
  );
};

export default Offer;
