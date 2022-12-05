import React from "react";
import { Row, Col } from "@canonical/react-components";
import { add, format } from "date-fns";

import { formatter, Product } from "advantage/subscribe/react/utils/utils";
import usePreview from "advantage/subscribe/react/hooks/usePreview";
import { UserSubscription } from "advantage/api/types";

const DATE_FORMAT = "dd MMMM yyyy";

type Props = {
  quantity: UserSubscription["number_of_machines"];
  product: Product;
};

function Summary({ quantity, product }: Props) {
  const sanitisedQuanity = Number(quantity) ?? 0;
  const { data: preview } = usePreview({ quantity: sanitisedQuanity, product });

  let totalSection = (
    <Row className="u-no-padding u-sv1">
      <Col size={4}>
        <div className="u-text-light">Subtotal:</div>
      </Col>
      <Col size={8}>
        <div data-testid="subtotal">
          {formatter.format(
            ((product?.price?.value ?? 0) * sanitisedQuanity) / 100
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
              <div data-testid="for-this-period">
                {formatter.format((preview?.total - preview?.taxAmount) / 100)}
              </div>
            </Col>
          </Row>
        )}
        <Row className="u-no-padding u-sv1">
          <Col size={4}>
            <div className="u-text-light">Tax:</div>
          </Col>
          <Col size={8}>
            <div data-testid="tax">
              {formatter.format(preview?.taxAmount / 100)}
            </div>
          </Col>
        </Row>
        <Row className="u-no-padding u-sv1">
          <Col size={4}>
            <div className="u-text-light">Total</div>
          </Col>
          <Col size={8}>
            <div data-testid="total">
              <b>{formatter.format(preview?.total / 100)}</b>
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
            <b>{formatter.format(preview?.total / 100)}</b>
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
            data-testid="name"
            dangerouslySetInnerHTML={{ __html: product?.name ?? "" }}
          />
        </Col>
      </Row>
      <Row className="u-no-padding u-sv1">
        <Col size={4}>
          <div className="u-text-light">Machines:</div>
        </Col>
        <Col size={8}>
          <div data-testid="machines">
            {quantity} x {formatter.format((product?.price?.value ?? 0) / 100)}
          </div>
        </Col>
      </Row>
      <Row className="u-no-padding u-sv1">
        <Col size={4}>
          <div className="u-text-light">Starts:</div>
        </Col>
        <Col size={8}>
          <div data-testid="start-date">{format(new Date(), DATE_FORMAT)}</div>
        </Col>
      </Row>
      <Row className="u-no-padding u-sv1">
        <Col size={4}>
          <div className="u-text-light">Ends:</div>
        </Col>

        {preview?.subscriptionEndOfCycle ? (
          <Col size={8}>
            <div data-testid="end-date">
              {format(new Date(preview?.subscriptionEndOfCycle), DATE_FORMAT)}
            </div>
            <br />
            <small>The same date as your existing subscription.</small>
          </Col>
        ) : (
          <Col size={8}>
            <div data-testid="end-date">
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
