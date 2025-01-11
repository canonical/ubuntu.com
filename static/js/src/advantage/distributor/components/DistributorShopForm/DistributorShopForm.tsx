import { Row, Col, Strip } from "@canonical/react-components";
import DealRegistration from "./DealRegistration/DealRegistration";
import Currency from "./Currency/Currency";
import Duration from "./Duration";
import TechnicalUserContact from "./TechnicalUserContact/TechnicalUserContact";
import AddSubscriptions from "./AddSubscriptions/AddSubscriptions";

const DistributorShopForm = () => {
  return (
    <form className="distributor-shop-selector">
      <ol className="p-stepped-list">
        <li className="p-stepped-list__item">
          <Strip includeCol={false} className="u-no-padding--top">
            <Row>
              <Col size={6}>
                <h2 className="p-stepped-list__title">
                  Verify deal registration information
                </h2>
              </Col>
              <Col size={6}>
                <DealRegistration />
              </Col>
            </Row>
          </Strip>
          <Row>
            <hr className="p-rule is-muted" />
          </Row>
        </li>
        <li className="p-stepped-list__item">
          <Strip includeCol={false} className="u-no-padding--top">
            <Row>
              <Col size={6}>
                <h2 className="p-stepped-list__title">
                  Fill in technical user&lsquo;s contact
                </h2>
              </Col>
              <Col size={6}>
                <TechnicalUserContact />
              </Col>
            </Row>
          </Strip>
        </li>
        <Row>
          <hr className="p-rule is-muted" />
        </Row>
        <li className="p-stepped-list__item">
          <Strip includeCol={false} className="u-no-padding--top">
            <Row>
              <Col size={6}>
                <h2 className="p-stepped-list__title">Select your currency</h2>
              </Col>
              <Col size={6}>
                <Currency />
              </Col>
            </Row>
          </Strip>
        </li>
        <Row>
          <hr className="p-rule is-muted" />
        </Row>
        <li className="p-stepped-list__item">
          <Strip includeCol={false} className="u-no-padding--top">
            <Row>
              <Col size={6}>
                <h2 className="p-stepped-list__title">Add subscriptions</h2>
              </Col>
              <Col size={6}>
                <AddSubscriptions />
              </Col>
            </Row>
          </Strip>
        </li>
        <Row>
          <hr className="p-rule is-muted" />
        </Row>
        <li className="p-stepped-list__item">
          <Strip includeCol={false} className="u-no-padding--top">
            <Row>
              <Col size={6}>
                <h2 className="p-stepped-list__title">
                  Select the subscription duration
                </h2>
              </Col>
              <Col size={6}>
                <Duration />
              </Col>
            </Row>
          </Strip>
        </li>
      </ol>
    </form>
  );
};

export default DistributorShopForm;
