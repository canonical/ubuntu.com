import React, { useMemo, useEffect } from "react";
import { add, format } from "date-fns";
import { useFormikContext } from "formik";
import { Col, Row, Spinner } from "@canonical/react-components";
import * as Sentry from "@sentry/react";
import { currencyFormatter } from "advantage/react/utils";
import useCalculate from "../../hooks/useCalculate";
import usePreview from "../../hooks/usePreview";
import {
  Action,
  Coupon,
  CheckoutProducts,
  FormValues,
  TaxInfo,
} from "../../utils/types";
import { UserSubscriptionMarketplace } from "advantage/api/enum";
import DistributorSummary from "../DistributorSummary.tsx/DistributorSummary";
import type { DisplayError } from "../../utils/types";
import { start } from "repl";

const DATE_FORMAT = "dd MMMM yyyy";

type Props = {
  products: CheckoutProducts[];
  action: Action;
  setError: React.Dispatch<React.SetStateAction<DisplayError | null>>;
  setErrorType: React.Dispatch<React.SetStateAction<string>>;
  coupon: Coupon;
  setIsTotalLoading: React.Dispatch<React.SetStateAction<boolean>>;
};

function Summary({
  products,
  action,
  coupon,
  setError,
  setErrorType,
  setIsTotalLoading,
}: Props) {
  const { values } = useFormikContext<FormValues>();

  const { data: calculate, isFetching: isCalculateFetching } = useCalculate({
    products,
    country: values.country,
    VATNumber: values.VATNumber,
    isTaxSaved: values.isTaxSaved,
  });

  const {
    data: preview,
    isFetching: isPreviewFetching,
    error: error,
  } = usePreview({
    products,
    action,
    coupon,
  });

  const isSummaryLoading = isPreviewFetching || isCalculateFetching;
  const priceData: TaxInfo | undefined = preview || calculate;
  const taxAmount = (priceData?.tax ?? 0) / 100;
  const total = (priceData?.total ?? 0) / 100;
  const marketplace = products[0]?.product.marketplace;
  const product = products[0]?.product;
  const quantity = products[0]?.quantity;

  const units =
    marketplace === UserSubscriptionMarketplace.CanonicalUA
      ? "Machines"
      : marketplace === "canonical-cube"
        ? "Exams"
        : "Users";

  const planType =
    marketplace === "canonical-cube"
      ? "Product"
      : action !== "offer"
        ? "Plan type"
        : "Products";

  const productName =
    action !== "offer"
      ? product?.name === "cue-linux-essentials-free"
        ? "CUE.01 Linux"
        : product?.name
      : product?.name.replace(", ", "<br>");

  const discount =
    (product?.price?.value * ((product?.price?.discount ?? 0) / 100)) / 100;
  const defaultTotal = (product?.price?.value * quantity) / 100 - discount;

  const calculateProductEndDate = () => {
    const addObj: {
      days?: number;
      weeks?: number;
      months?: number;
      years?: number;
    } = {};
    const period = product?.period;
    const quantity = product?.periodQuantity ?? 1;
    if (period === "monthly" && quantity === 1) {
      addObj.months = quantity;
    } else if (period === "monthly" && quantity > 1) {
      addObj.days = quantity;
    } else {
      addObj.years = quantity;
    }
    let initialDate = new Date();
    if (product?.startDate) {
      initialDate = add(new Date(product.startDate), {days: 1});
    }
    return format(add(initialDate, addObj), DATE_FORMAT);
  };
  
  const endDate = useMemo(() => calculateProductEndDate(), [product]);

  useEffect(() => {
    if (error instanceof Error) {
      let message = <></>;
      let errorType = "";
      if (error.message.includes("can only make one purchase at a time")) {
        message = (
          <>
            You already have a pending purchase. Please go to{" "}
            <a href="/account/payment-methods">payment method</a> to retry.
          </>
        );
      } else if (
        error.message.includes(
          "cannot make a purchase while subscription is in trial",
        )
      ) {
        message = (
          <>
            You cannot make a purchase during the trial period. To make a new
            purchase, cancel your current trial subscription.
          </>
        );
      } else if (
        error.message.includes(
          "missing one-off product listing for renewal product",
        )
      ) {
        message = (
          <>
            {" "}
            The chosen product cannot be renewed as it has been deprecated.
            Contact <a href="https://ubuntu.com/contact-us">Canonical sales </a>
            to choose a substitute offering.
          </>
        );
      } else if (
        error.message.includes(
          "user has been banned from purchasing products in the canonical-cube marketplace",
        )
      ) {
        message = (
          <>
            You cannot make this purchase as your account has been banned from
            purchasing CUE exams.
          </>
        );
        errorType = "cue-banned";
      } else if (
        error.message.includes(
          "cannot purchase the same exam more than two times",
        )
      ) {
        message = <>You cannot purchase the same exam more than two times.</>;
        errorType = "cue-exam-limit";
      } else {
        message = <>Sorry, there was an unknown error with your purchase.</>;
      }
      Sentry.captureException(error);
      setError({ description: message });
      setErrorType(errorType);
      document.querySelector("h1")?.scrollIntoView();
      return;
    }
  }, [error]);

  useEffect(() => {
    setIsTotalLoading?.(isSummaryLoading);
  }, [isSummaryLoading]);

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
                product?.id !== "cue-01-linux" &&
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
                        100,
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
  return marketplace === UserSubscriptionMarketplace.CanonicalProChannel ? (
    <DistributorSummary
      products={products}
      priceData={priceData}
      taxAmount={taxAmount}
      isSummaryLoading={isSummaryLoading}
      error={error}
    />
  ) : (
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
            <strong>{format(product.startDate?add(new Date(product.startDate), {days: 1}): new Date(), DATE_FORMAT)}</strong>
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
            <p>
              This subscription is co-termed with your existing subscription.
              Both subscriptions will end on the same date.
            </p>
          </Col>
        ) : (
          <Col size={8}>
            <p data-testid="end-date">
              <strong>{endDate}</strong>
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
