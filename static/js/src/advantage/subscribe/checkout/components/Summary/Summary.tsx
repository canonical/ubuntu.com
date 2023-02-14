import React from "react";
import { add, format } from "date-fns";
import { Col, Row, Spinner } from "@canonical/react-components";
import { currencyFormatter } from "advantage/react/utils";
import useGetTaxAmount from "../../hooks/useGetTaxAmount";
import usePreview from "../../hooks/usePreview";
import { Action, Product, TaxInfo } from "../../utils/types";

const DATE_FORMAT = "dd MMMM yyyy";

type Props = {
  product: Product;
  quantity: number;
  action: Action;
};

function Summary({ quantity, product, action }: Props) {
  const sanitisedQuanity = Number(quantity) ?? 0;
  const { data: taxData } = useGetTaxAmount();
  const { data: preview } = usePreview({ quantity, product, action });

  const priceData: TaxInfo | undefined = preview || taxData;

  const taxAmount = (priceData?.tax ?? 0) / 100;
  const total = (priceData?.total ?? 0) / 100;
  const units = product?.marketplace === "canonical-ua" ? "Machines" : "Users";
  const planType = action !== "offer" ? "Plan type" : "Products";
  const productName =
    action !== "offer" ? product?.name : product?.name.replace(", ", "<br>");

  let totalSection = (
    <>
      {priceData?.subtotal && (
        <Row className="u-no-padding u-sv1">
          <Col size={4}>
            <div className="u-text-light">Discount:</div>
          </Col>
          <Col size={8}>
            <div data-testid="discount">
              {currencyFormatter.format(
                ((product?.price?.value - priceData.subtotal) *
                  sanitisedQuanity) /
                  100
              )}
            </div>
          </Col>
        </Row>
      )}
      <Row className="u-no-padding u-sv1">
        <Col size={4}>
          <div className="u-text-light">Subtotal:</div>
        </Col>
        <Col size={8}>
          <div data-testid="subtotal">
            {!priceData ? (
              <>
                <Spinner /> Loading&hellip;
              </>
            ) : (
              currencyFormatter.format(
                (((priceData ? priceData.subtotal : product?.price?.value) ??
                  0) *
                  sanitisedQuanity) /
                  100
              )
            )}
          </div>
        </Col>
      </Row>
    </>
  );

  if (taxAmount && total) {
    totalSection = (
      <>
        {priceData?.end_of_cycle && (
          <Row className="u-no-padding u-sv1">
            <Col size={4}>
              <div className="u-text-light">For this period:</div>
            </Col>
            <Col size={8}>
              <div data-testid="for-this-period">
                {currencyFormatter.format(total - taxAmount)}
              </div>
            </Col>
          </Row>
        )}
        {priceData?.total && product?.price?.value !== priceData.total && (
          <Row className="u-no-padding u-sv1">
            <Col size={4}>
              <div className="u-text-light">Discount:</div>
            </Col>
            <Col size={8}>
              <div data-testid="discount">
                {currencyFormatter.format(
                  ((product?.price?.value - priceData.total) *
                    sanitisedQuanity) /
                    100 +
                    taxAmount
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
            <div data-testid="tax">{currencyFormatter.format(taxAmount)}</div>
          </Col>
        </Row>
        <Row className="u-no-padding u-sv1">
          <Col size={4}>
            <div className="u-text-light">Total</div>
          </Col>
          <Col size={8}>
            <div data-testid="total">
              <b>{currencyFormatter.format(total)}</b>
            </div>
          </Col>
        </Row>
      </>
    );
  } else if (priceData?.end_of_cycle) {
    totalSection = (
      <>
        {priceData?.total && product?.price?.value !== priceData.total && (
          <Row className="u-no-padding u-sv1">
            <Col size={4}>
              <div className="u-text-light">Discount:</div>
            </Col>
            <Col size={8}>
              <div data-testid="discount">
                {currencyFormatter.format(
                  ((product?.price?.value - priceData.total) *
                    sanitisedQuanity) /
                    100
                )}
              </div>
            </Col>
          </Row>
        )}
        <Row className="u-no-padding u-sv1">
          <Col size={4}>
            <div className="u-text-light">
              Total
              {priceData?.end_of_cycle && " for this period"}
            </div>
          </Col>
          <Col size={8}>
            <div>
              <b>{currencyFormatter.format(total)}</b>
            </div>
          </Col>
        </Row>
      </>
    );
  }
  return (
    <section
      id="summary-section"
      className="p-strip is-shallow u-no-padding--top"
    >
      <Row className="u-no-padding u-sv1">
        <Col size={4}>
          <div className="u-text-light">{planType}:</div>
        </Col>
        <Col size={8}>
          <div
            data-testid="name"
            dangerouslySetInnerHTML={{ __html: productName ?? "" }}
          />
        </Col>
      </Row>
      <Row className="u-no-padding u-sv1">
        <Col size={4}>
          <div className="u-text-light">{units}:</div>
        </Col>
        <Col size={8}>
          <div data-testid="machines">
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
          <div data-testid="start-date">{format(new Date(), DATE_FORMAT)}</div>
        </Col>
      </Row>
      <Row className="u-no-padding u-sv1">
        <Col size={4}>
          <div className="u-text-light">Ends:</div>
        </Col>
        {priceData?.end_of_cycle ? (
          <Col size={8}>
            <div data-testid="end-date">
              {format(new Date(priceData?.end_of_cycle), DATE_FORMAT)}
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
