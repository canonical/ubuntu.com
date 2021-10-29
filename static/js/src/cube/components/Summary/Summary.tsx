import React from "react";
import { Row, Col } from "@canonical/react-components";
import { formatter } from "../../../advantage/subscribe/renderers/form-renderer";
import usePreview from "../../hooks/usePreview";

type Props = {
  productListingId: string;
};

const Summary = ({ productListingId }: Props) => {
  const { isLoading, isError, data: preview } = usePreview(productListingId);

  return (
    <section
      id="summary-section"
      className="p-strip is-shallow u-no-padding--top"
      aria-live="polite"
      aria-busy={isLoading ? "true" : "false"}
    >
      {isLoading ? (
        <Row className="u-no-padding u-sv1">
          <Col size={12} className="u-align--center">
            <i className="p-icon--spinner u-animation--spin u-align--center"></i>
          </Col>
        </Row>
      ) : isError ? (
        <i className="u-align--center">
          An error occurred while fetching product information.
        </i>
      ) : (
        <>
          <Row className="u-no-padding u-sv1">
            <Col size={4}>
              <div className="u-text-light">Product:</div>
            </Col>
            <Col size={8}>
              <div>{preview?.lineItems[0]?.description}</div>
            </Col>
          </Row>
          <Row className="u-no-padding u-sv1">
            <Col size={4}>
              <div className="u-text-light">Subtotal:</div>
            </Col>
            <Col size={8}>
              <div>{formatter.format(preview?.amountDue / 100)}</div>
            </Col>
          </Row>
        </>
      )}
    </section>
  );
};

export default Summary;
