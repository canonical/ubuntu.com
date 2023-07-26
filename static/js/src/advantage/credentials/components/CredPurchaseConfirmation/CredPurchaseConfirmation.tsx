import { Button, Col, Row } from "@canonical/react-components";
import React from "react";
import { useSearchParams } from "react-router-dom";

const CredPurchaseConfirmation = () => {
  const [queryParameters] = useSearchParams();
  const quantity = queryParameters.get("quantity");
  const product = queryParameters.get("productName");
  return (
    <section className="u-fixed-width p-strip">
      <Row>
        <h2>Thank You for your order!</h2>
        <p className="p-heading-4">
          {quantity} x {product}
        </p>
      </Row>
      <Row>
        <Col size={8}>
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
