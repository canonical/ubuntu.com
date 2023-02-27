import React from "react";
import { add, format } from "date-fns";
import { Col, Row } from "@canonical/react-components";
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
    <Row>
      <Col size={4}>
        <p>Total:</p>
      </Col>
      <Col size={8}>
        <p data-testid="subtotal">
          <strong>
            {currencyFormatter.format(
              ((product?.price?.value ?? 0) * sanitisedQuanity) / 100
            )}
          </strong>
        </p>
      </Col>
    </Row>
  );

  if (taxAmount && total) {
    totalSection = (
      <>
        {priceData?.end_of_cycle && (
          <>
            <Row>
              <Col size={4}>
                <p>For this period:</p>
              </Col>
              <Col size={8}>
                <p data-testid="for-this-period">
                  <strong>{currencyFormatter.format(total - taxAmount)}</strong>
                </p>
              </Col>
            </Row>
            <hr />
          </>
        )}
        <Row>
          <Col size={4}>
            <p>Tax:</p>
          </Col>
          <Col size={8}>
            <p data-testid="tax">
              <strong>{currencyFormatter.format(taxAmount)}</strong>
            </p>
          </Col>
        </Row>
        <hr />
        <Row>
          <Col size={4}>
            <p>Total:</p>
          </Col>
          <Col size={8}>
            <p data-testid="total">
              <strong>{currencyFormatter.format(total)}</strong>
            </p>
          </Col>
        </Row>
      </>
    );
  } else if (priceData?.end_of_cycle) {
    totalSection = (
      <Row>
        <Col size={4}>
          <p>
            Total
            {priceData?.end_of_cycle && " for this period"}
          </p>
        </Col>
        <Col size={8}>
          <p>
            <strong>{currencyFormatter.format(total)}</strong>
          </p>
        </Col>
      </Row>
    );
  }
  return (
    <section
      id="summary-section"
      className="p-strip is-shallow u-no-padding--top"
    >
      <Row>
        <Col size={4}>
          <p>{planType}:</p>
        </Col>
        <Col size={8}>
          <p
            style={{ fontWeight: "bold" }}
            data-testid="name"
            dangerouslySetInnerHTML={{ __html: productName ?? "" }}
          />
        </Col>
      </Row>
      <hr />
      <Row>
        <Col size={4}>
          <p>{units}:</p>
        </Col>
        <Col size={8}>
          <p data-testid="machines">
            <strong>
              {quantity} x{" "}
              {currencyFormatter.format((product?.price?.value ?? 0) / 100)}
            </strong>
          </p>
        </Col>
      </Row>
      <hr />
      <Row>
        <Col size={4}>
          <p>Starts:</p>
        </Col>
        <Col size={8}>
          <p data-testid="start-date">
            <strong>{format(new Date(), DATE_FORMAT)}</strong>
          </p>
        </Col>
      </Row>
      <hr />
      <Row>
        <Col size={4}>
          <p>Ends:</p>
        </Col>
        {priceData?.end_of_cycle ? (
          <Col size={8}>
            <p data-testid="end-date">
              <strong>
                {format(new Date(priceData?.end_of_cycle), DATE_FORMAT)}
              </strong>
            </p>
            <p>The same date as your existing subscription.</p>
          </Col>
        ) : (
          <Col size={8}>
            <p data-testid="end-date">
              <strong>
                {format(
                  add(new Date(), {
                    months: product?.period === "monthly" ? 1 : 12,
                  }),
                  DATE_FORMAT
                )}
              </strong>
            </p>
          </Col>
        )}
      </Row>
      <hr />
      {totalSection}
    </section>
  );
}

export default Summary;
