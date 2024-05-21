import React, { useContext } from "react";
import { Col, Row, Strip } from "@canonical/react-components";
import OrderSummary from "./components/Order/OrderSummary/OrderSummary";
import OrderDetail from "./components/Order/OrderDetail/OrderDetail";
import { FormContext } from "./utils/FormContext";

const Order = () => {
  const { offer } = useContext(FormContext);

  if (!offer) {
    return (
      <Strip className="p-section">
        <h1>Somethinig is wrong.</h1>
        <p>
          Initiate order again at <a href="/pro/distributor">this page</a>.
        </p>
      </Strip>
    );
  }

  return (
    <Strip shallow style={{ overflow: "unset" }}>
      <div
        className="p-section--shallow"
        style={{ textDecoration: "underline" }}
      >
        <a href="/pro/distributor/shop">Edit order</a>
      </div>
      <div className="p-section--shallow">
        <h1>Your order</h1>
      </div>
      <Row>
        <Col size={7}>
          <OrderSummary />
        </Col>
        <Col size={5}>
          <OrderDetail />
        </Col>
      </Row>
    </Strip>
  );
};

export default Order;
