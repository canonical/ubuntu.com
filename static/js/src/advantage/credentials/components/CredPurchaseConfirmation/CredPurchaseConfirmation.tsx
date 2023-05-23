import { Button, Col, Row } from "@canonical/react-components";
import React from "react";
import { Link, useSearchParams } from "react-router-dom";

const CredPurchaseConfirmation = () => {
  const [queryParameters] = useSearchParams();
  const quantity = queryParameters.get("quantity");
  const product = queryParameters.get("productName");
  return (
    <section className="u-fixed-width">
      <Row>
        <h2>Thank You for your order!</h2>
        <p className="p-heading-4">
          {quantity} x {product}
        </p>
        <h2>How to use an activation key to redeem exam attempts</h2>
      </Row>
      <Row>
        <Col size={8} className="col-start-large-2">
          <h3>Log in to /credentials/redeem</h3>
          <p>
            Enter your key on /credentials/redeem to redeem your exam attempt.
            After activation, you will be able to take your exam right away or
            schedule it for another day.
          </p>
          <a href="/credentials/redeem">
            <Button appearance="positive">Activate your exam attempt</Button>
          </a>
          <h3>Manage Your Keys</h3>
          <p>
            Want to see exam attempt codes you already purchased? Go to
            /credentials/manage-exam-attempts.
          </p>
          <Link to="/manage">
            <Button appearance="positive">Manage Keys</Button>
          </Link>
          <h3>Manage Your Exams</h3>
          <p>
            Need to schedule or re-schedule an exam? Go to
            /credentials/your-exams.
          </p>
          <a href="/credentials/your-exams">
            <Button appearance="positive">Your Exams</Button>
          </a>
        </Col>
      </Row>
      <Row>
        <p>
          Consult our FAQ for further questions, or contact us at{" "}
          <a href="mailto:credentials@canonical.com">
            credentials@canonical.com
          </a>
          .
        </p>
      </Row>
    </section>
  );
};
export default CredPurchaseConfirmation;
