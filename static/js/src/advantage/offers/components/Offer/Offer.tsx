import React from "react";
import { Card, Col, Row } from "@canonical/react-components";
import { UserSubscriptionPeriod } from "advantage/api/enum";
import { currencyFormatter } from "advantage/react/utils";
import { Product } from "advantage/subscribe/checkout/utils/types";
import { Item, Offer as OfferType } from "../../types";
import PaymentButton from "../PaymentButton";

type Props = {
  offer: OfferType;
};

const Offer = ({ offer }: Props) => {
  const { id, marketplace, items, total, discount } = offer;
  const names = items.map((item: Item) => {
    return `${item.allowance ?? 0} x ${item.name}`;
  });

  const product: Product = {
    longId: id ?? "",
    period: UserSubscriptionPeriod.Yearly,
    marketplace: marketplace,
    id: id,
    name: names.join(", "),
    price: {
      value: Number(total),
    },
    canBeTrialled: false,
  };

  return (
    <Card data-testid="offer-card">
      <Row>
        <Col size={6} small={2} medium={2}>
          <p className="p-text--x-small-capitalised">Contract item</p>
        </Col>
        <Col size={3} small={1} medium={2}>
          <p className="p-text--x-small-capitalised">Allowance</p>
        </Col>
        <Col size={3} small={1} medium={2}>
          <p className="p-text--x-small-capitalised">Price</p>
        </Col>
      </Row>
      <hr />
      {items.map((item: Item) => {
        return (
          <Row key={item.id}>
            <Col size={6} small={2} medium={2}>
              <p>
                <strong>{item.name}</strong>
              </p>
            </Col>
            <Col size={3} small={1} medium={2}>
              <p>{item.allowance ?? 0}</p>
            </Col>
            <Col size={3} small={1} medium={2}>
              <p>{currencyFormatter.format(item.price / 100)}</p>
            </Col>
          </Row>
        );
      })}
      <Row>
        <Col
          size={3}
          emptyLarge={7}
          small={2}
          emptySmall={2}
          medium={2}
          emptyMedium={3}
        >
          <p className="p-text--x-small-capitalised col-3 col-start-large-7">
            Total before taxes
          </p>
        </Col>
        <Col size={3} small={1} medium={2}>
          <p className="col-3">{currencyFormatter.format(total / 100)}</p>
        </Col>
      </Row>
      {discount && (
        <>
          <Row>
            <Col
              size={3}
              emptyLarge={7}
              small={2}
              emptySmall={2}
              medium={2}
              emptyMedium={3}
            >
              <p className="p-text--x-small-capitalised col-3 col-start-large-7">
                Discount amount
              </p>
            </Col>
            <Col size={3} small={1} medium={2}>
              <p className="col-3">
                - {currencyFormatter.format((total * (discount / 100)) / 100)} (
                {discount}%)
              </p>
            </Col>
          </Row>
          <Row>
            <Col
              size={3}
              emptyLarge={7}
              small={2}
              emptySmall={2}
              medium={2}
              emptyMedium={3}
            >
              <p className="p-text--x-small-capitalised col-3 col-start-large-7">
                Total after discount
              </p>
            </Col>
            <Col size={3} small={1} medium={2}>
              <p className="col-3">
                {currencyFormatter.format(
                  (total - total * (discount / 100)) / 100
                )}
              </p>
            </Col>
          </Row>
        </>
      )}
      <Row>
        <Col size={12} className="u-align--right">
          <PaymentButton product={product} />
        </Col>
      </Row>
    </Card>
  );
};

export default Offer;
