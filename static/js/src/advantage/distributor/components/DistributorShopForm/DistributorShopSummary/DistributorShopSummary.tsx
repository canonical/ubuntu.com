import React, { useContext } from "react";
import { Chip, Col, Row } from "@canonical/react-components";
import { Offer as OfferType } from "../../../../offers/types";
import PaymentButton from "../PaymentButton";
import { FormContext } from "advantage/distributor/utils/FormContext";
import { currencyFormatter } from "advantage/distributor/utils/utils";
type Prop = {
  offer: OfferType;
};

const DistributorShopSummary = ({ offer }: Prop) => {
  const { discount } = offer;
  const { products, currency } = useContext(FormContext);

  const total = Number(
    products?.reduce(
      (total, product) => Number(total) + Number(product.price.value),
      0
    )
  );

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
              {currency
                ? currencyFormatter(currency).format((total ?? 0) / 100)
                : 0}
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
                currencyFormatter(currency).format(
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
