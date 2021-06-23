import React from "react";
import { Row, Col } from "@canonical/react-components";
import { formatter } from "../../renderers/form-renderer";
import { format } from "date-fns";
import usePreview from "../APICalls/usePreview";
import useProduct from "../APICalls/useProduct";
import { DATE_FORMAT } from "./Summary";
import { useFormikContext } from "formik";
const TotalSection = () => {
  const { product, quantity, isMonthly } = useProduct();
  const { data: preview } = usePreview();
  const { values } = useFormikContext();

  const total = formatter.format(
    preview ? preview.total / 100 : (product?.price?.value * quantity) / 100
  );

  if (isMonthly || true) {
    return (
      <>
        <Row className="u-no-padding u-sv1">
          <Col size="4">
            <div className="u-text-light">Monthly total:</div>
          </Col>
          <Col size="8">
            <div>
              <strong>{total}</strong>
            </div>
          </Col>
          {preview?.taxAmount ? null : (
            <Col size="8" emptyLarge="5">
              <div className="u-text-light">Excluding VAT</div>
            </Col>
          )}
        </Row>
        {values.freeTrial === "useFreeTrial" && (
          <Row className="u-no-padding u-sv1">
            <Col size="4">
              <div className="u-text-light">To pay today:</div>
            </Col>
            <Col size="8">
              <div>
                $0 today -{" "}
                <strong>
                  {total} on{" "}
                  {format(
                    new Date(preview?.subscriptionEndOfCycle),
                    DATE_FORMAT
                  )}
                </strong>
              </div>
            </Col>
          </Row>
        )}
        <Row className="u-no-padding u-sv1">
          <Col size="4">
            <div className="u-text-light">Renews on:</div>
          </Col>

          <Col size="8">
            <strong>
              {format(new Date(preview?.subscriptionEndOfCycle), DATE_FORMAT)}
            </strong>
            <br />
            <small>
              You can control auto-renewal in your Ubuntu Advantage account at
              any time.
            </small>
          </Col>
        </Row>
      </>
    );
  }

  return (
    <Row className="u-no-padding u-sv1">
      <Col size="4">
        <div className="u-text-light">Total:</div>
      </Col>
      <Col size="8">
        <div>
          <strong>{total}</strong>
        </div>
      </Col>
      {preview?.taxAmount ? null : (
        <Col size="8" emptyLarge="5">
          <div className="u-text-light">Excluding VAT</div>
        </Col>
      )}
    </Row>
  );
};

export default TotalSection;
