import React, { useContext } from "react";
import { Card, Col, Row } from "@canonical/react-components";
import { ExternalId as ExternalIdType } from "../../../../offers/types";
import { FormContext } from "advantage/distributor/utils/FormContext";

const DealRegistration = () => {
  const { offer } = useContext(FormContext);

  const deal_registration_id = offer?.external_ids?.filter(
    (external_id: ExternalIdType) => (external_id.origin = "Zift")
  )[0]["ids"];
  const distributor_account_name = offer?.distributor_account_name;

  return (
    <>
      <Card
        className="deal-registration-card"
        title={`Deal registration ID ${deal_registration_id}`}
      >
        <hr />
        <Row>
          <Col size={3}>
            <h5>Company</h5>
            <div>Company Name</div>
            <div>Street</div>
            <div>City</div>
            <div>Country</div>
          </Col>
          <Col size={3}>
            <h5>Contact</h5>
            <div>{distributor_account_name}</div>
            <div>Contact email</div>
          </Col>
        </Row>
      </Card>
    </>
  );
};

export default DealRegistration;
