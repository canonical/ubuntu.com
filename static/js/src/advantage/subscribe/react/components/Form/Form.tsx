import { Col, Row, Strip } from "@canonical/react-components";
import React from "react";
import Feature from "./Feature";
import Quantity from "./Quantity";
import Support from "./Support";
import ProductType from "./ProductType";
import Version from "./Version";

const Form = () => {
  return (
    <form className="product-selector">
      <Strip bordered includeCol={false}>
          <Col size={6}>
            <h3>What are you setting up?</h3>
          </Col>
          <Col size={6}>
            <ProductType />
          </Col>
      </Strip>
      <Strip bordered includeCol={false}>
          <Col size={6}>
            <h3>For how many machines?</h3>
          </Col>
          <Col size={6}>
            <Quantity />
          </Col>
      </Strip>
      <Strip bordered includeCol={false}>
          <Col size={6}>
            <h3>What Ubuntu LTS version are you running?</h3>
          </Col>
          <Col size={6}>
            <Version />
          </Col>
      </Strip>
      <Strip bordered includeCol={false}>
          <Col size={12}>
            <h3>What security coverage do you need?</h3>
          </Col>
          <Col size={12}>
            <Feature />
          </Col>
      </Strip>
      <Strip bordered includeCol={false}>
          <Col size={12}>
            <h3>Do you need phone and ticket support?</h3>
          </Col>
          <Col size={12}>
            <Support />
          </Col>
      </Strip>
    </form>
  );
};

export default Form;
