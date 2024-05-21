import React, { useContext } from "react";
import { Row, Col } from "@canonical/react-components";
import { FormContext } from "advantage/distributor/utils/FormContext";
import { ExternalId as ExternalIdType } from "../../../../offers/types";

const OrderSummary = () => {
  const { offer } = useContext(FormContext);

  const deal_registration_id = offer?.external_ids?.filter(
    (external_id: ExternalIdType) => (external_id.origin = "Zift")
  )[0]["ids"];
  const reseller_account_name = offer?.reseller_account_name;
  return (
    <>
      <div className="p-section--shallow">
        <div className="order-summary-label">Order ID</div>
        <div className="order-summary-value">12345</div>
        <div className="order-summary-label">Deal registreation ID</div>
        <div className="order-summary-value">{deal_registration_id}</div>
        <div>
          <hr className="p-rule u-sv3" />
        </div>
      </div>
      <div className="p-section--shallow">
        <Row>
          <Col size={3}>
            <div className="p-text--small-caps">Reseller&lsquo;s contact</div>
            <div>{reseller_account_name}</div>
            <div className="order-summary-value">John.doe@acne.com</div>
            <div>Acne Inc. United States</div>
            <div className="u-text--muted">123 Address place,</div>
            <div className="u-text--muted">San Francisco</div>
            <div className="u-text--muted">California, 94016</div>
            <div className="u-text--muted">United States</div>
          </Col>
          <Col size={3}>
            <div className="p-text--small-caps">
              Techinical user&lsquo;s contact
            </div>
            <div>Maya Sardegna</div>
            <div className="order-summary-value">Maya.sardegna@tuc.com</div>
            <div>TechUserCorp. Germany</div>
            <div className="u-text--muted">456 Address place,</div>
            <div className="u-text--muted">Berlin</div>
            <div className="u-text--muted">Branderburg 10115,</div>
            <div className="u-text--muted">Germany</div>
          </Col>
        </Row>
      </div>
    </>
  );
};

export default OrderSummary;
