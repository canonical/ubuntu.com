import React from "react";
import { Chip, Col, Row } from "@canonical/react-components";
import { Offer as OfferType } from "../../../../offers/types";
import { currencyFormatter } from "advantage/react/utils";
import PaymentButton from "../PaymentButton";
type Prop = {
  offer: OfferType;
};

const DistributorShopSummary = ({ offer }: Prop) => {
  const { total, discount } = offer;

  return (
    <>
      <section
        className="p-strip--light is-shallow p-shop-cart u-hide--small u-hide--medium"
        id="summary-section"
        data-testid="summary-section"
      >
        <Row className="u-sv3">
          <Col size={4}>
            <h5>Total before discount</h5>
          </Col>
          <Col size={6}>
            <h5>Discounts</h5>
          </Col>
          <Col size={2} className="u-align--right">
            <h5>Total per year</h5>
          </Col>
          <hr />
          <Col size={4}>
            <p className="p-heading--2" data-testid="summary-product-name">
              {currencyFormatter.format((total ?? 0) / 100)}
            </p>
          </Col>
          <Col size={6}>
            <Chip
              value={`${discount}% discount applied`}
              appearance="information"
              style={{ marginTop: "0.5rem" }}
            />
          </Col>
          <Col size={2} className="u-align--right">
            <p className="p-heading--2">
              {discount &&
                currencyFormatter.format(
                  (total - total * (discount / 100)) / 100
                )}
            </p>{" "}
            <p className="p-text--small">
              Any applicable taxes are <br /> calculated at checkout
            </p>
          </Col>
          <Col
            className="u-align--right"
            size={4}
            emptyLarge={9}
            style={{ display: "flex", alignItems: "center" }}
          >
            <PaymentButton />
          </Col>
        </Row>
      </section>
    </>
  );
};

export default DistributorShopSummary;
