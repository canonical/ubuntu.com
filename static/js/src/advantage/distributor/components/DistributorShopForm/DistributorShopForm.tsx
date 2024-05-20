import React from "react";
import { Row, Col, Strip } from "@canonical/react-components";
import DealRegistration from "./DealRegistration/DealRegistration";
import Currency from "./Currency/Currency";
import Duration from "./Duration";
import TechnicalUserContact from "./TechnicalUserContact/TechnicalUserContact";
import AddSubscriptions from "./AddSubscriptions/AddSubscriptions";
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
      <Row>
        <hr />
      </Row>
      <Strip includeCol={false}>
        <Row>
          <Col size={6}>
            <h2>Fill in technical user&lsquo;s contact</h2>
          </Col>
          <Col size={6}>
            <TechnicalUserContact offer={offer} />
          </Col>
        </Row>
      </Strip>
      <Row>
        <hr />
      </Row>
      <Strip includeCol={false}>
        <Row>
          <Col size={6}>
            <h2>Select your currency</h2>
          </Col>
          <Col size={6}>
            <Currency />
          </Col>
        </Row>
      </Strip>
      <Row>
        <hr />
      </Row>
      <Strip includeCol={false}>
        <Row>
          <Col size={6}>
            <h2>Add subscriptions</h2>
          </Col>
          <Col size={6}>
            <AddSubscriptions />
          </Col>
        </Row>
      </Strip>
      <Row>
        <hr />
      </Row>
      <Strip includeCol={false}>
        <Row>
          <Col size={6}>
            <h2>Select the subscription duration</h2>
          </Col>
          <Col size={6}>
            <Duration />
          </Col>
        </Row>
      </Strip>
    </form>
  );
};

export default DistributorShopForm;
