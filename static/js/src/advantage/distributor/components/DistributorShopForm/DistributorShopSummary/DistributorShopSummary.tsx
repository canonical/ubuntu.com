import { useContext } from "react";
import { Chip, Col, Row } from "@canonical/react-components";
import { FormContext } from "advantage/distributor/utils/FormContext";
import {
  ChannelProduct,
  SubscriptionItem,
  currencyFormatter,
  getProductId,
} from "advantage/distributor/utils/utils";
import DistributorBuyButton from "../../DistributorBuyButton/DistributorBuyButton";

const DistributorShopSummary = () => {
  const { products, currency, subscriptionList, offer } =
    useContext(FormContext);
  const discount = offer?.discount;

  let totalPrice = 0;

  subscriptionList?.forEach((subscription: SubscriptionItem) => {
    totalPrice +=
      products?.reduce((total: number, product: ChannelProduct | undefined) => {
        if (subscription && product) {
          const productId = getProductId(
            subscription.type,
            subscription.support,
            subscription.sla,
          );

          if (
            productId === product?.productID &&
            product?.price?.value !== undefined
          ) {
            const productTotalPrice =
              subscription.quantity * product.price.value;
            return total + productTotalPrice;
          }
        }
        return total;
      }, 0) || 0;
  });

  return (
    <>
      <section
        className="p-strip--light is-shallow p-shop-cart p-shop-cart--distributor"
        id="summary-section"
        data-testid="summary-section"
      >
        <Row className="u-sv3">
          <Col size={4}>
            <h5>Total before discount</h5>
          </Col>
          <Col size={6}>
            <h5>Discounts</h5>
          </Col>
          <Col size={2} className="u-align--right">
            <h5>Total</h5>
          </Col>
          <hr />
          <Col size={4}>
            <p className="p-heading--2" data-testid="summary-product-name">
              {currency
                ? currencyFormatter(currency).format((totalPrice ?? 0) / 100)
                : 0}
            </p>
          </Col>
          <Col size={5}>
            <Chip
              value={`${discount ?? 0}% discount applied`}
              appearance="information"
              style={{ marginTop: "0.5rem" }}
            />
          </Col>
          <Col size={3} className="u-align--right">
            <p className="p-heading--2">
              {discount
                ? currencyFormatter(currency).format(
                    (totalPrice - totalPrice * (discount / 100)) / 100,
                  )
                : currency
                  ? currencyFormatter(currency).format((totalPrice ?? 0) / 100)
                  : 0}
            </p>{" "}
            <p className="p-text--small">
              Any applicable taxes are <br /> calculated at checkout
            </p>
          </Col>
          <Col
            className="u-align--right"
            size={3}
            emptyLarge={10}
            style={{ display: "flex", alignItems: "center" }}
          >
            <DistributorBuyButton />
          </Col>
        </Row>
      </section>
    </>
  );
};

export default DistributorShopSummary;
