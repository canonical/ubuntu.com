import { Row, Col, Strip } from "@canonical/react-components";
import React, { useContext } from "react";
import Feature from "./Feature";
import Quantity from "./Quantity";
import Support from "./Support";
import ProductType from "./ProductType";
import Version from "./Version";
import { FormContext } from "advantage/subscribe/react/utils/FormContext";
import {
  ProductUsers,
  isIoTDevice,
  isPublicCloud,
} from "advantage/subscribe/react/utils/utils";
import ProductUser from "./ProductUser/ProductUser";
const Form = () => {
  const { productType, productUser } = useContext(FormContext);
  const disabled = isPublicCloud(productType) || isIoTDevice(productType);

  return (
    <form className="product-selector">
      <Strip includeCol={false}>
        <Col size={6}>
          <h2>Who will be using this subscription?</h2>
        </Col>
        <Col size={6}>
          <ProductUser />
        </Col>
      </Strip>
      {productUser !== ProductUsers.myself ? (
        <>
          <Row>
            <hr />
          </Row>
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
                  <p style={{ marginLeft: "3.6rem" }}>
                    {" "}
                    Ubuntu Pro is available for Ubuntu 14.04 and higher.
                    <br />{" "}
                    <a href="/contact-us/form?product=pro">
                      Are you using an older version?
                    </a>
                  </p>
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
                  <h2>Do you also need phone and ticket support?</h2>
                </Col>
                <Col size={12}>
                  <Support />
                </Col>
              </Strip>
            </>
          )}
        </>
      ) : null}
    </form>
  );
};

export default Form;
