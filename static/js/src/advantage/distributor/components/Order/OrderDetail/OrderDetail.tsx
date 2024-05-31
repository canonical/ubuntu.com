import React, { useContext } from "react";
import { Card } from "@canonical/react-components";
import DistributorBuyButton from "../../DistributorBuyButton/DistributorBuyButton";
import { FormContext } from "advantage/distributor/utils/FormContext";
import {
  ChannelProduct,
  Currencies,
  SubscriptionItem,
  currencyFormatter,
  getProductId,
  DistributorProductTypes as ProductTypes,
  Durations,
  SLA,
  Support,
} from "advantage/distributor/utils/utils";

const OrderDetail = () => {
  const { subscriptionList, products, currency, duration, offer } = useContext(
    FormContext
  );

  const discount = offer?.discount;

  let totalPrice = 0;

  subscriptionList?.forEach((subscription: SubscriptionItem) => {
    totalPrice +=
      products?.reduce((total: number, product: ChannelProduct | undefined) => {
        if (subscription && product) {
          const productId = getProductId(
            subscription.type,
            subscription.support,
            subscription.sla
          );

          if (
            productId === product?.productID &&
            product?.price !== undefined
          ) {
            const productTotalPrice =
              subscription.quantity * product.price.value;
            return total + productTotalPrice;
          }
        }
        return total;
      }, 0) || 0;
  });

  const getProductTitle = (type: ProductTypes) => {
    switch (type) {
      case (type = ProductTypes.physical):
        return "Ubuntu Pro Physical";
      case (type = ProductTypes.desktop):
        return "Ubuntu Pro Desktop";
      case (type = ProductTypes.virtual):
        return "Ubuntu Pro Virtual";
    }
  };
  return (
    <Card className="order-detail-card">
      <div className="p-text--small-caps">Details</div>

      {subscriptionList?.map((subscription) => {
        const prod = products?.filter(
          (prod) =>
            prod.productID ===
            getProductId(
              subscription.type,
              subscription.support,
              subscription.sla
            )
        )?.[0];
        const quantityNumber: number = subscription.quantity;
        const durationsNumber: number =
          duration === Durations.one ? 1 : duration === Durations.two ? 2 : 3;
        const priceCurrency = prod?.price.currency as Currencies;
        const priceValue = (prod?.price.value as number) * quantityNumber;

        const support =
          subscription?.type === ProductTypes.desktop
            ? null
            : subscription.support == Support.none
            ? "Self support, "
            : `${subscription.support}, `;
        const sla =
          subscription.sla !== SLA.none
            ? `${subscription.sla} support, `
            : null;
        const quantity =
          quantityNumber === 1 ? "1 machine, " : `${quantityNumber} machines, `;
        const years: string =
          durationsNumber + (durationsNumber === 1 ? " year" : " years");

        return (
          <div className="order-field" key={subscription.id}>
            <div className="order-field-product">
              <div className="order-label">
                {getProductTitle(subscription?.type as ProductTypes)}
              </div>
              <div className="order-value">
                {support}
                {sla}
                {quantity}
                {years}
              </div>
              <div className="order-value">CQC1X1902????</div>
            </div>
            <div className="order-value">
              {priceCurrency
                ? currencyFormatter(priceCurrency).format(
                    (priceValue ?? 0) / 100
                  )
                : 0}
            </div>
          </div>
        );
      })}
      <hr />
      <div className="order-field">
        <div className="order-label">Subtotal</div>
        <div className="order-value">
          {currency
            ? currencyFormatter(currency).format((totalPrice ?? 0) / 100)
            : 0}
        </div>
      </div>
      <hr />
      <div className="order-field">
        <div className="order-label">Discount ({discount}% off subtotal)</div>
        <div className="order-value">
          &minus;
          {discount &&
            currencyFormatter(currency).format(
              (totalPrice * (discount / 100)) / 100
            )}
        </div>
      </div>
      <hr />
      <div className="order-total-field">
        <div className="order-label">Total per year</div>
        <div className="order-value">
          {discount &&
            currencyFormatter(currency).format(
              (totalPrice - totalPrice * (discount / 100)) / 100
            )}
        </div>
      </div>
      <DistributorBuyButton />
    </Card>
  );
};

export default OrderDetail;
