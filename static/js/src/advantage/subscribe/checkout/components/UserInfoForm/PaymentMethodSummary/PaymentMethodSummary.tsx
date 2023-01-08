import React from "react";
import { Col, Row } from "@canonical/react-components";
import useCustomerInfo from "../../../hooks/useCustomerInfo";

export const cardImageMap = {
  visa: "https://assets.ubuntu.com/v1/2060e728-VBM_COF.png",
  mastercard: "https://assets.ubuntu.com/v1/f42c6739-mc_symbol.svg",
  amex: "https://assets.ubuntu.com/v1/5f4f3f7b-Amex_logo_color.svg",
  discover: "https://assets.ubuntu.com/v1/f5e8abde-discover_logo.jpg",
};

function PaymentMethodSummary() {
  const { data: userInfo } = useCustomerInfo();

  const defaultPaymentMethod = userInfo?.customerInfo?.defaultPaymentMethod;

  return (
    <>
      <Row className="u-no-padding">
        <Col size={6} className="u-vertically-center">
          <p className="u-text-light">Payment method:</p>
        </Col>
      </Row>

      <div className="p-card">
        <Row className="u-no-padding">
          <Col size={2} medium={1} small={1}>
            <img
              src={
                cardImageMap[
                  defaultPaymentMethod?.brand as keyof typeof cardImageMap
                ]
              }
            />
          </Col>
          <Col size={8} small={3}>
            <span data-test="card">
              <span style={{ textTransform: "capitalize" }}>
                {defaultPaymentMethod?.brand}
              </span>{" "}
              ending in {defaultPaymentMethod?.last4}
            </span>
          </Col>
          <Col size={2} small={3} emptySmall={2}>
            <span className="u-text-light">Expires:</span>
            <br />
            <span data-test="expiry-date">
              {defaultPaymentMethod?.expMonth?.toString()?.padStart(2, "0")}/
              {defaultPaymentMethod?.expYear?.toString()?.slice(-2)}
            </span>
          </Col>
        </Row>
      </div>
    </>
  );
}

export default PaymentMethodSummary;
