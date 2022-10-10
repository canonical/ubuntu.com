import React from "react";
import { Row, Col } from "@canonical/react-components";
import OffersList from "./components/OffersList";

const Offers = () => {
  return (
    <div className="p-strip--suru-topped">
      <Row>
        <Col size={12}>
          <h1>Your Ubuntu Pro offers</h1>
        </Col>
      </Row>
      <Row>
        <Col size={12}>
          <OffersList />
        </Col>
      </Row>
    </div>
  );
};

export default Offers;
