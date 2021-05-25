import React from "react";
import { Row, Col } from "@canonical/react-components";
import { add, format } from "date-fns";
import { formatter } from "../../renderers/form-renderer";
import usePreview from "../APICalls/Preview";

const DATE_FORMAT = "dd MMMM yyyy";

function Summary({ product, quantity }) {
  const { data: preview } = usePreview(product, quantity);

  return (
    <section
      id="summary-section"
      className="p-strip is-shallow u-no-padding--top"
    >
      <Row className="u-no-padding u-sv1">
        <Col size="4">
          <div className="u-text-light">Plan type:</div>
        </Col>
        <Col size="8">
          <div>{product.name}</div>
        </Col>
      </Row>
      <Row className="u-no-padding u-sv1">
        <Col size="4">
          <div className="u-text-light">Machines:</div>
        </Col>
        <Col size="8">
          <div>
            {quantity} x {formatter.format(product.price.value / 100)}
          </div>
        </Col>
      </Row>
      <Row className="u-no-padding u-sv1">
        <Col size="4">
          <div className="u-text-light">Starts:</div>
        </Col>
        <Col size="8">
          <div>{format(new Date(), DATE_FORMAT)}</div>
        </Col>
      </Row>
      {preview ? (
        <>
          <Row className="u-no-padding u-sv1">
            <Col size="4">
              <div className="u-text-light">Ends:</div>
            </Col>

            <Col size="8">
              {format(new Date(preview.subscriptionEndOfCycle), DATE_FORMAT)}
              <br />
              <small>The same date as your existing subscription.</small>
            </Col>
          </Row>
          {preview.taxAmount ? (
            <>
              <Row className="u-no-padding u-sv1">
                <Col size="4">
                  <div className="u-text-light">For this period:</div>
                </Col>
                <Col size="8">
                  <div>
                    {formatter.format(
                      (preview.total - preview.taxAmount) / 100
                    )}
                  </div>
                </Col>
              </Row>
              <Row className="u-no-padding u-sv1">
                <Col size="4">
                  <div className="u-text-light">Tax:</div>
                </Col>
                <Col size="8">
                  <div>{formatter.format(preview.taxAmount / 100)}</div>
                </Col>
              </Row>
              <Row className="u-no-padding u-sv1">
                <Col size="4">
                  <div className="u-text-light">Total:</div>
                </Col>
                <Col size="8">
                  <div>
                    <b>{formatter.format(preview.total / 100)}</b>
                  </div>
                </Col>
              </Row>
            </>
          ) : (
            <Row className="u-no-padding u-sv1">
              <Col size="4">
                <div className="u-text-light">For this period:</div>
              </Col>
              <Col size="8">
                <div>{formatter.format(preview.total / 100)}</div>
              </Col>
            </Row>
          )}
        </>
      ) : (
        <>
          <Row className="u-no-padding u-sv1">
            <Col size="4">
              <div className="u-text-light">Ends:</div>
            </Col>
            <Col size="8">
              <div>
                {format(
                  add(new Date(), {
                    months: product.period === "monthly" ? 1 : 12,
                  }),
                  DATE_FORMAT
                )}
              </div>
            </Col>
          </Row>
          <Row className="u-no-padding u-sv1">
            <Col size="4">
              <div className="u-text-light">Subtotal:</div>
            </Col>
            <Col size="8">
              <div>
                {formatter.format((product.price.value * quantity) / 100)}
              </div>
            </Col>
          </Row>
        </>
      )}
    </section>
  );
}

export default Summary;
