import { Fragment } from "react";
import { format } from "date-fns";
import { Col, Row, Spinner } from "@canonical/react-components";
import { CheckoutProducts, TaxInfo } from "../../utils/types";
import {
  Currencies,
  currencyFormatter,
} from "advantage/distributor/utils/utils";

const DATE_FORMAT = "dd MMMM yyyy";

type Props = {
  products: CheckoutProducts[];
  priceData: TaxInfo | undefined;
  taxAmount: number;
  isSummaryLoading: boolean;
  error: any;
};

function DistributorSummary({
  products,
  priceData,
  taxAmount,
  isSummaryLoading,
  error,
}: Props) {
  const extractDuration = (productId: string): number => {
    const match = productId.match(/(\d+)y/);
    return match ? parseInt(match[1], 10) : 1;
  };

  const currency = products[0].product.price.currency as Currencies;
  const duration = extractDuration(products[0].product.id);
  const { totalDiscount, totalDefaultTotal } = products.reduce(
    (acc, product) => {
      const priceValue = product?.product?.price?.value / 100 ?? 0;
      const discountPercentage = product?.product?.price?.discount ?? 0;
      const quantity = product?.quantity ?? 0;
      const discount = (priceValue * discountPercentage) / 100;
      const defaultTotal = (priceValue - discount) * quantity;

      acc.totalDiscount += discount * quantity;
      acc.totalDefaultTotal += defaultTotal;

      return acc;
    },
    { totalDiscount: 0, totalDefaultTotal: 0 },
  );

  const discount = totalDiscount;
  const defaultTotal = totalDefaultTotal;

  let totalSection = (
    <>
      {discount && discount !== 0 ? (
        <>
          <Row>
            <Col size={4}>
              <p>Discount:</p>
            </Col>
            <Col size={8}>
              <p data-testid="discount">
                <strong>
                  &minus;{" "}
                  {currency
                    ? currencyFormatter(currency).format(Number(discount) ?? 0)
                    : 0}
                </strong>
              </p>
            </Col>
          </Row>
          <hr />
        </>
      ) : null}
      <Row>
        <Col size={4}>
          <p>Total:</p>
        </Col>
        <Col size={8}>
          <p data-testid="subtotal">
            <strong>
              {currency
                ? currencyFormatter(currency).format(Number(defaultTotal) ?? 0)
                : 0}
            </strong>
          </p>
        </Col>
      </Row>
    </>
  );

  if (priceData && taxAmount && defaultTotal) {
    totalSection = (
      <>
        {discount && discount !== 0 ? (
          <>
            <Row>
              <Col size={4}>
                <p>Discount:</p>
              </Col>
              <Col size={8}>
                <p data-testid="discount">
                  <strong>
                    &minus;{" "}
                    {currency
                      ? currencyFormatter(currency).format(
                          Number(discount) ?? 0,
                        )
                      : 0}
                  </strong>
                </p>
              </Col>
            </Row>
            <hr />
          </>
        ) : null}
        <Row>
          <Col size={4}>
            <p>Tax:</p>
          </Col>
          <Col size={8}>
            <p data-testid="tax">
              <strong>
                {currency
                  ? currencyFormatter(currency).format(Number(taxAmount) ?? 0)
                  : 0}
              </strong>
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
              <strong>
                {currency
                  ? currencyFormatter(currency).format(
                      Number(defaultTotal) + Number(taxAmount) || 0,
                    )
                  : 0}
              </strong>
            </p>
          </Col>
        </Row>
      </>
    );
  }

  const displayTotal = isSummaryLoading ? (
    <>
      {" "}
      <Spinner /> Loading&hellip;{" "}
    </>
  ) : error ? (
    <>
      <i className="p-icon--error"></i> <strong>Purchase error</strong>
    </>
  ) : (
    totalSection
  );

  return (
    <section
      id="summary-section"
      className="p-strip is-shallow u-no-padding--top"
    >
      <Row>
        <Col size={4}>
          <p>Products:</p>
        </Col>
        <Col size={6}>
          {products.map((product) => {
            const validProduct = product.product?.id;
            const productName = validProduct.includes("-virtual-")
              ? "Ubuntu Pro virtual"
              : validProduct.includes("-desktop-")
                ? "Ubuntu Pro Desktop"
                : "Ubuntu Pro";
            const quantity = product.quantity;
            const support = validProduct.includes("advanced")
              ? "24/7 Support, "
              : validProduct.includes("standard")
                ? "Weekday Support, "
                : "";
            const infra = validProduct.includes("uio") ? "Infra, " : "";

            return (
              <Fragment key={product.product.longId}>
                <p data-testid="name" className="u-no-margin--bottom">
                  {quantity} x {productName}
                </p>
                <p className="u-text--muted">
                  {infra}
                  {support}
                  {duration}
                  {duration === 1 ? " year" : " years"}
                </p>
              </Fragment>
            );
          })}
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
        {duration && (
          <Col size={8}>
            <p data-testid="end-date">
              <strong>
                {format(
                  new Date().setFullYear(new Date().getFullYear() + duration),
                  DATE_FORMAT,
                )}
              </strong>
            </p>
          </Col>
        )}
      </Row>
      <hr />
      <Row>
        <Col size={4}>
          <p>Price:</p>
        </Col>
        <Col size={6}>
          {products.map((product) => {
            const quantity = product.quantity;
            const price = product.product?.price?.value;
            return (
              <p key={product.product.longId}>
                <strong>
                  {quantity} x{" "}
                  {currency
                    ? currencyFormatter(currency).format(
                        (Number(price) ?? 0) / 100 / duration,
                      )
                    : 0}{" "}
                  x {duration} {duration === 1 ? "year" : "years"}
                </strong>
              </p>
            );
          })}
        </Col>
      </Row>
      <hr />
      {displayTotal}
    </section>
  );
}

export default DistributorSummary;
