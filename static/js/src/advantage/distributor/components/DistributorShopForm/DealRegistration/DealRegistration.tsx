import { useContext } from "react";
import { Card, Col, Row } from "@canonical/react-components";
import { FormContext } from "advantage/distributor/utils/FormContext";

const DealRegistration = () => {
  const { offer } = useContext(FormContext);

  const opportunity_number = offer?.opportunity_number;
  const end_user_account_name = offer?.end_user_account_name;
  const reseller_account_name = offer?.reseller_account_name;

  return (
    <>
      <Card
        className="deal-registration-card"
        title={`Deal registration ID ${opportunity_number}`}
      >
        <hr />
        <Row>
          <Col size={3}>
            <h5>Reseller Company</h5>
            <div>{reseller_account_name}</div>
          </Col>
          <Col size={3}>
            <h5>Technical user company</h5>
            <div>{end_user_account_name}</div>
          </Col>
        </Row>
      </Card>
    </>
  );
};

export default DealRegistration;
