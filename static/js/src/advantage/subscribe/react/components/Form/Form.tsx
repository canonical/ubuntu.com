import { Row, Col, Strip } from "@canonical/react-components";
import React, { useContext } from "react";
import Feature from "./Feature";
import Quantity from "./Quantity";
import Support from "./Support";
import ProductType from "./ProductType";
import Version from "./Version";
import { FormContext } from "advantage/subscribe/react/utils/FormContext";
import {
  IoTDevices,
  isIoTDevice,
  isPublicCloud,
} from "advantage/subscribe/react/utils/utils";
const Form = () => {
  const { productType, iotDevice } = useContext(FormContext);
  const disabled =
    isPublicCloud(productType) ||
    (isIoTDevice(productType) && iotDevice === IoTDevices.core);

  return (
    <form className="product-selector">
      <Strip includeCol={false}>
        <Col size={6}>
          <h2>What are you setting up?</h2>
        </Col>
        <Col size={6}>
          <ProductType />
        </Col>
      </Strip>
      {!disabled && (
        <>
          <Row>
            <hr />
          </Row>
          <Strip includeCol={false}>
            <Col size={6}>
              <h2>For how many machines?</h2>
            </Col>
            <Col size={6}>
              <Quantity />
            </Col>
          </Strip>
          <Row>
            <hr />
          </Row>

          <Strip includeCol={false}>
            <Col size={6}>
              <h2>What Ubuntu LTS version are you running?</h2>
            </Col>
            <Col size={6}>
              <Version />
            </Col>
          </Strip>
          <Row>
            <hr />
          </Row>
          <Strip includeCol={false}>
            <Col size={12}>
              <h2>What security coverage do you need?</h2>
            </Col>
            <Col size={12}>
              <Feature />
            </Col>
          </Strip>
          <Row>
            <hr />
          </Row>
          <Strip includeCol={false}>
            <Col size={12}>
              <h2>Do you need phone and ticket support?</h2>
            </Col>
            <Col size={12}>
              <Support />
            </Col>
          </Strip>
        </>
      )}
    </form>
  );
};

export default Form;
