import { Row, Col, Strip } from "@canonical/react-components";
import { useContext } from "react";
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
      <ol className="p-stepped-list">
        <li className="p-stepped-list__item">
          <Strip includeCol={false}>
            <Col size={6}>
              <h2 className="p-stepped-list__title">
                Who will be using this subscription?
              </h2>
            </Col>
            <Col size={6}>
              <ProductUser />
            </Col>
          </Strip>
        </li>
        {productUser !== ProductUsers.myself ? (
          <>
            <Row>
              <hr />
            </Row>
            <li className="p-stepped-list__item">
              <Strip includeCol={false}>
                <Col size={6}>
                  <h2 className="p-stepped-list__title">
                    What are you setting up?
                  </h2>
                </Col>
                <Col size={6}>
                  <ProductType />
                </Col>
              </Strip>
            </li>
            {!disabled && (
              <>
                <Row>
                  <hr />
                </Row>
                <li className="p-stepped-list__item">
                  <Strip includeCol={false}>
                    <Col size={6}>
                      <h2 className="p-stepped-list__title">
                        For how many machines?
                      </h2>
                    </Col>
                    <Col size={6}>
                      <Quantity />
                    </Col>
                  </Strip>
                </li>
                <Row>
                  <hr />
                </Row>
                <li className="p-stepped-list__item">
                  <Strip includeCol={false}>
                    <Col size={6}>
                      <h2 className="p-stepped-list__title">
                        What Ubuntu LTS version are you running?
                      </h2>
                      <p style={{ marginLeft: "3.6rem" }}>
                        {" "}
                        Ubuntu Pro is available for Ubuntu 16.04 LTS and higher.
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
                </li>
                <Row>
                  <hr />
                </Row>
                <li className="p-stepped-list__item">
                  <Strip includeCol={false}>
                    <Feature />
                  </Strip>
                </li>
                <Row>
                  <hr />
                </Row>
                <li className="p-stepped-list__item">
                  <Strip includeCol={false}>
                    <Col size={12}>
                      <h2 className="p-stepped-list__title">
                        Do you also need phone and ticket support?
                      </h2>
                    </Col>
                    <Col size={12}>
                      <Support />
                    </Col>
                  </Strip>
                </li>
              </>
            )}
          </>
        ) : null}
      </ol>
    </form>
  );
};

export default Form;
