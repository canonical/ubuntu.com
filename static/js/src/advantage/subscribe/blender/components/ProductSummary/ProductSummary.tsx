import React, { useContext } from "react";
import { Col, Row, Select } from "@canonical/react-components";
import { FormContext } from "../../utils/FormContext";
import { isMonthlyAvailable, Periods } from "../../utils/utils";
import { currencyFormatter } from "advantage/react/utils";
import PaymentModal from "../PaymentModal";

const ProductSummary = () => {
  const { quantity, period, setPeriod, product } = useContext(FormContext);
  const handlePeriodChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setPeriod(event.target.value as Periods);
    localStorage.setItem(
      "period",
      JSON.stringify(event.target.value as Periods)
    );
  };

  const isHidden = !product || !quantity || quantity < 1;

  return (
    <section
      className={`p-strip--light is-shallow p-shop-cart ${
        isHidden ? "p-shop-cart--hidden" : ""
      }`}
      id="summary-section"
    >
      <Row>
        <Col size={12}>
          <h3>Your chosen plan</h3>
        </Col>
      </Row>
      <Row className="u-sv3">
        <Col size={8} className="p-shop-cart__selected-product">
          <span id="summary-plan-quantity">{quantity} x </span>
          <span id="summary-plan-name">{product?.name}</span>
          {isMonthlyAvailable(product) ? (
            <div>
              <Select
                name="billing-period"
                className="u-no-margin--bottom"
                defaultValue={period}
                options={[
                  {
                    label: "Annual billing",
                    value: Periods.yearly,
                  },
                  {
                    label: "Monthly billing",
                    value: Periods.monthly,
                  },
                ]}
                onChange={handlePeriodChange}
              />
              {period === Periods.monthly ? (
                <p className="p-text--small">
                  <strong>Switch to annual billing and save over 15%</strong>
                </p>
              ) : null}
            </div>
          ) : null}
        </Col>
        <Col size={4} className="p-shop-cart__buy">
          <span>
            <strong>
              {currencyFormatter.format(
                ((product?.price.value ?? 0) / 100) * quantity
              )}{" "}
              /{period === Periods.yearly ? "year" : "month"}
            </strong>
          </span>
          <PaymentModal isHidden={isHidden} />
          <p className="p-text--small">
            Any applicable taxes are calculated before payment
          </p>
        </Col>
      </Row>
    </section>
  );
};

export default ProductSummary;
