import React, { useContext } from "react";
import { Col, Row, Select, StatusLabel } from "@canonical/react-components";
import { FormContext } from "advantage/subscribe/react/utils/FormContext";
import {
  IoTDevices,
  isMonthlyAvailable,
  Periods,
  ProductTypes,
} from "../../utils/utils";
import { currencyFormatter } from "advantage/react/utils";
import PaymentModal from "../PaymentModal";

const ProductSummary = () => {
  const {
    quantity,
    period,
    setPeriod,
    product,
    iotDevice,
    productType,
  } = useContext(FormContext);
  const handlePeriodChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setPeriod(event.target.value as Periods);
    localStorage.setItem(
      "pro-selector-period",
      JSON.stringify(event.target.value as Periods)
    );
  };
  const isHidden =
    !product ||
    !quantity ||
    quantity < 1 ||
    (productType === ProductTypes.iotDevice && iotDevice === IoTDevices.core);

  return (
    <>
      <section
        className={`p-strip--light is-shallow p-shop-cart u-hide--small ${
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
          <Col size={6}>
            <p className="p-heading--2">{product?.name}</p>
            <a href="/legal/ubuntu-pro-description">
              See full service description
            </a>
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
              {productType === ProductTypes.iotDevice &&
              iotDevice === IoTDevices.core
                ? currencyFormatter.format(0)
                : currencyFormatter.format(
                    ((product?.price.value ?? 0) / 100) *
                      (Number(quantity) ?? 0)
                  )}
            </p>{" "}
            <p className="p-text--small">
              per {period === Periods.yearly ? "year" : "month"}
            </p>
            <p className="p-text--small">
              Any applicable taxes are calculated at checkout
            </p>
          </Col>
          <Col
            className={"u-align--right"}
            size={4}
            emptyLarge={9}
            style={{ display: "flex", alignItems: "center" }}
          >
            {product?.canBeTrialled ? (
              <StatusLabel appearance="positive">
                Free trial available
              </StatusLabel>
            ) : null}
            <PaymentModal isHidden={isHidden} />
          </Col>
        </Row>
      </section>
      <section
        className={`p-strip--light is-shallow p-shop-cart--small u-hide u-show--small ${
          isHidden ? "p-shop-cart--hidden" : ""
        }`}
        id="summary-section"
      >
        <Row className="u-sv3">
          <Col size={12}>
            <p>
              {quantity} subscription{quantity > 1 ? "s" : ""} for
            </p>
          </Col>
          <Col size={12}>
            <p className="p-heading--2">{product?.name}</p>
          </Col>
          <Col size={12}>
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
          <Col size={1} small={2}>
            <p className="p-heading--2">
              {currencyFormatter.format(
                ((product?.price.value ?? 0) / 100) * (Number(quantity) ?? 0)
              )}
            </p>
            <a href="/legal/ubuntu-pro-description">
              See full service description
            </a>
          </Col>
          <Col size={1} small={2}>
            <p>per {period === Periods.yearly ? "year" : "month"}</p>
            <p className="p-text--small">
              Any applicable taxes are calculated at checkout
            </p>
          </Col>
          <Col size={12}>
            <PaymentModal isHidden={isHidden} />
          </Col>
          {product?.canBeTrialled ? (
            <Col size={12}>
              <StatusLabel appearance="positive">
                Free trial available
              </StatusLabel>
            </Col>
          ) : null}
        </Row>
      </section>
    </>
  );
};

export default ProductSummary;
