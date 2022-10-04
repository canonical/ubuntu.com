import React, { useContext } from "react";
import { Chip, Col, Row, Select } from "@canonical/react-components";
import { FormContext } from "advantage/subscribe/react/utils/FormContext";
import { isMonthlyAvailable, Periods } from "../../utils/utils";
import { currencyFormatter } from "advantage/react/utils";
import PaymentModal from "../PaymentModal";

const ProductSummary = () => {
  const { quantity, period, setPeriod, product } = useContext(FormContext);
  const handlePeriodChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setPeriod(event.target.value as Periods);
  };

  const isHidden = !product || !quantity || quantity < 1;

  return (
    <section
      className={`p-strip--light is-shallow p-shop-cart ${
        isHidden ? "p-shop-cart--hidden" : ""
      }`}
      id="summary-section"
    >
      <Row className="u-sv3">
        <Col size={6} className="p-text--x-small-capitalised">
          Subscription
        </Col>
        <Col size={2} className="u-align--right p-text--x-small-capitalised">
          Quantity
        </Col>
        <Col size={2} className="p-text--x-small-capitalised">
          Billing
        </Col>
        <Col size={2} className="u-align--right p-text--x-small-capitalised">
          Total
        </Col>
        <hr />
        <Col size={6} className="p-heading--2">
          {product?.name}
        </Col>
        <Col size={2} className="u-align--right p-heading--2">
          {quantity}
        </Col>
        <Col size={2} style={{ lineHeight: "4rem" }}>
          {isMonthlyAvailable(product) ? (
            <>
              <Select
                name="billing-period"
                className="u-no-margin--bottom"
                defaultValue={period}
                options={[
                  {
                    label: "Billed Annually",
                    value: Periods.yearly,
                  },
                  {
                    label: "Billed Monthly",
                    value: Periods.monthly,
                  },
                ]}
                onChange={handlePeriodChange}
              />
            </>
          ) : (
            "Billed Yearly"
          )}
        </Col>
        <Col size={2} className="u-align--right">
          <p className="p-heading--2">
            {currencyFormatter.format(
              ((product?.price.value ?? 0) / 100) * (Number(quantity) ?? 0)
            )}
          </p>{" "}
          <p className="p-text--small">
            per {period === Periods.yearly ? "year" : "month"}
          </p>
          <p className="p-text--small">
            Any applicable taxes are calculated at checkout
          </p>
        </Col>
        <Col className={"u-align--right"} size={4} emptyLarge={9}>
          {product?.canBeTrialled ? (
            <Chip appearance="positive" value="Free trial available" />
          ) : null}
          <PaymentModal isHidden={isHidden} />
        </Col>
      </Row>
    </section>
  );
};

export default ProductSummary;
