import React, { useContext } from "react";
import { Row, Col } from "@canonical/react-components";
import { add, format } from "date-fns";
import usePreview from "advantage/subscribe/react/hooks/usePreview";
import { FormContext } from "../../utils/FormContext";
import { currencyFormatter } from "advantage/react/utils";

const DATE_FORMAT = "dd MMMM yyyy";

function Summary() {
  const { quantity, product } = useContext(FormContext);
  const { data: preview } = usePreview({ quantity, product });
  let totalSection = (
    <Row className="u-no-padding u-sv1">
      <Col size={4}>
        <div className="u-text-light">Subtotal:</div>
      </Col>
      <Col size={8}>
        <div data-test="subtotal">
          {currencyFormatter.format(
            ((product?.price?.value ?? 0) * quantity) / 100
          )}
        </div>
      </Col>
    </Row>
  );

  if (preview?.taxAmount) {
    totalSection = (
      <>
        {preview?.subscriptionEndOfCycle && (
          <Row className="u-no-padding u-sv1">
            <Col size={4}>
              <div className="u-text-light">For this period:</div>
            </Col>
            <Col size={8}>
              <div data-test="for-this-period">
                {currencyFormatter.format(
                  (preview?.total - preview?.taxAmount) / 100
                )}
              </div>
            </Col>
          </Row>
        )}
        <Row className="u-no-padding u-sv1">
          <Col size={4}>
            <div className="u-text-light">Tax:</div>
          </Col>
          <Col size={8}>
            <div data-test="tax">
              {currencyFormatter.format(preview?.taxAmount / 100)}
            </div>
          </Col>
        </Row>
        <Row className="u-no-padding u-sv1">
          <Col size={4}>
            <div className="u-text-light">Total</div>
          </Col>
          <Col size={8}>
            <div data-test="total">
              <b>{currencyFormatter.format(preview?.total / 100)}</b>
            </div>
          </Col>
        </Row>
      </>
    );
  } else if (preview) {
    totalSection = (
      <Row className="u-no-padding u-sv1">
        <Col size={4}>
          <div className="u-text-light">
            Total
            {preview?.subscriptionEndOfCycle && " for this period"}
          </div>
        </Col>
        <Col size={8}>
          <div>
            <b>{currencyFormatter.format(preview?.total / 100)}</b>
          </div>
        </Col>
      </Row>
    );
  }

  return (
    <section
      id="summary-section"
      className="p-strip is-shallow u-no-padding--top"
    >
      <Row className="u-no-padding u-sv1">
        <Col size={4}>
          <div className="u-text-light">Plan type:</div>
        </Col>
        <Col size={8}>
          <div
            data-test="name"
            dangerouslySetInnerHTML={{ __html: product?.name ?? "" }}
          />
        </Col>
      </Row>
      <Row className="u-no-padding u-sv1">
        <Col size={4}>
          <div className="u-text-light">Users:</div>
        </Col>
        <Col size={8}>
          <div data-test="users">
            {quantity} x{" "}
            {currencyFormatter.format((product?.price?.value ?? 0) / 100)}
          </div>
        </Col>
      </Row>
      <Row className="u-no-padding u-sv1">
        <Col size={4}>
          <div className="u-text-light">Starts:</div>
        </Col>
        <Col size={8}>
          <div data-test="start-date">{format(new Date(), DATE_FORMAT)}</div>
        </Col>
      </Row>
      <Row className="u-no-padding u-sv1">
        <Col size={4}>
          <div className="u-text-light">Ends:</div>
        </Col>

        {preview?.subscriptionEndOfCycle ? (
          <Col size={8}>
            <div data-test="end-date">
              {format(new Date(preview?.subscriptionEndOfCycle), DATE_FORMAT)}
            </div>
            <br />
            <small>The same date as your existing subscription.</small>
          </Col>
        ) : (
          <Col size={8}>
            <div data-test="end-date">
              {format(
                add(new Date(), {
                  months: product?.period === "monthly" ? 1 : 12,
                }),
                DATE_FORMAT
              )}
            </div>
          </Col>
        )}
      </Row>
      {totalSection}
    </section>
  );
}

export default Summary;
