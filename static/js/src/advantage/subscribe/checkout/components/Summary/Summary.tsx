import React, { useEffect } from "react";
import { add, format } from "date-fns";
import { useFormikContext } from "formik";
import { Col, Row, Spinner } from "@canonical/react-components";
import * as Sentry from "@sentry/react";
import { currencyFormatter } from "advantage/react/utils";
import useCalculate from "../../hooks/useCalculate";
import usePreview from "../../hooks/usePreview";
import { Action, FormValues, Product, TaxInfo } from "../../utils/types";

const DATE_FORMAT = "dd MMMM yyyy";

type Props = {
  product: Product;
  quantity: number;
  action: Action;
  setError: React.Dispatch<React.SetStateAction<React.ReactNode>>;
};

function Summary({ quantity, product, action, setError }: Props) {
  const { values } = useFormikContext<FormValues>();
  const { data: calculate, isFetching: isCalculateFetching } = useCalculate({
    quantity: quantity,
    marketplace: product.marketplace,
    productListingId: product.longId,
    country: values.country,
    VATNumber: values.VATNumber,
    isTaxSaved: values.isTaxSaved,
  });

  const {
    data: preview,
    isFetching: isPreviewFetching,
    error: error,
  } = usePreview({
    quantity,
    product,
    action,
  });

  const isSummaryLoading = isPreviewFetching || isCalculateFetching;
  const priceData: TaxInfo | undefined = preview || calculate;
  const taxAmount = (priceData?.tax ?? 0) / 100;
  const total = (priceData?.total ?? 0) / 100;
  const units =
    product?.marketplace === "canonical-ua"
      ? "Machines"
      : product?.marketplace === "canonical-cube"
      ? "Exams"
      : "Users";
  const planType =
    product?.marketplace === "canonical-cube"
      ? "Product"
      : action !== "offer"
      ? "Plan type"
      : "Products";
  const productName =
    action !== "offer" ? product?.name : product?.name.replace(", ", "<br>");
  const discount =
    (product?.price?.value * ((product?.price?.discount ?? 0) / 100)) / 100;
  const defaultTotal = (product?.price?.value * quantity) / 100 - discount;

  useEffect(() => {
    if (error instanceof Error) {
      let message = <></>;
      if (error.message.includes("can only make one purchase at a time")) {
        message = (
          <>
            You already have a pending purchase. Please go to{" "}
            <a href="/account/payment-methods">payment methods</a> to retry.
          </>
        );
      } else if (
        error.message.includes(
          "cannot make a purchase while subscription is in trial"
        )
      ) {
        message = (
          <>
            You cannot make a purchase during the trial period. To make a new
            purchase, cancel your current trial subscription.
          </>
        );
      } else {
        message = <>Sorry, there was an unknown error with your purchase.</>;
      }
      Sentry.captureException(error);
      setError(message);
      document.querySelector("h1")?.scrollIntoView();
      return;
    }
  }, [error]);

  let totalSection = (
    <>
      {product?.price?.discount && (
        <>
          <Row>
            <Col size={4}>
              <p>Discount:</p>
            </Col>
            <Col size={8}>
              <p data-testid="discount">
                <strong>&minus; {currencyFormatter.format(discount)}</strong>
              </p>
            </Col>
          </Row>
          <hr />
        </>
      )}
      <Row>
        <Col size={4}>
          <p>Total:</p>
        </Col>
        <Col size={8}>
          <p data-testid="subtotal">
            <strong>
              {priceData
                ? currencyFormatter.format(total)
                : currencyFormatter.format(defaultTotal)}
            </strong>
          </p>
          <p>
            <>
              {total == 0 &&
                priceData !== undefined &&
                "This is because you have likely already paid for this product for the current billing period."}
            </>
          </p>
        </Col>
      </Row>
    </>
  );

  if (taxAmount && total) {
    totalSection = (
      <>
        {product?.price?.discount && (
          <>
            <Row>
              <Col size={4}>
                <p>Discount:</p>
              </Col>
              <Col size={8}>
                <p data-testid="discount">
                  <strong>&minus; {currencyFormatter.format(discount)}</strong>
                </p>
              </Col>
            </Row>
            <hr />
          </>
        )}
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
      <>
        {action === "offer" && product?.price?.discount && (
          <>
            <Row>
              <Col size={4}>
                <p>Discount:</p>
              </Col>
              <Col size={8}>
                <p data-testid="discount">
                  <strong>
                    &minus;{" "}
                    {currencyFormatter.format(
                      (product?.price?.value *
                        (product?.price?.discount / 100)) /
                        100
                    )}
                  </strong>
                </p>
              </Col>
            </Row>
            <hr />
          </>
        )}
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
      </>
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
      {!isSummaryLoading ? (
        <>
          {!error ? (
            totalSection
          ) : (
            <>
              <i className="p-icon--error"></i> <strong>Purchase error</strong>
            </>
          )}
        </>
      ) : (
        <>
          {" "}
          <Spinner /> Loading&hellip;{" "}
        </>
      )}
    </section>
  );
}

export default Summary;
