import React from "react";
import { Row, Col, Strip } from "@canonical/react-components";
import DealRegistration from "./DealRegistration/DealRegistration";
import { Offer as OfferType } from "../../../offers/types";

type Prop = {
  offer: OfferType;
};

const DistributorShopForm = ({ offer }: Prop) => {
  return (
    <form className="distributor-shop-selector">
      <Strip includeCol={false}>
        <Row>
          <Col size={6}>
            <h2>Verify deal registration information</h2>
          </Col>
          <Col size={6}>
            <DealRegistration offer={offer} />
          </Col>
        </Row>
      </Strip>
    </form>
  );
};

export default DistributorShopForm;
