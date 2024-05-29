import React, { useContext } from "react";
import { Button } from "@canonical/react-components";
import { FormContext } from "advantage/distributor/utils/FormContext";
import {
  ChannelProduct,
  Durations,
  SubscriptionItem,
  getProductId,
} from "advantage/distributor/utils/utils";
import { Product } from "advantage/subscribe/checkout/utils/types";
import { UserSubscriptionPeriod } from "advantage/api/enum";

const DistributorBuyButton = () => {
  const { products, subscriptionList, offer, duration } = useContext(
    FormContext
  );

  const getProductQauntity = (product: ChannelProduct) => {
    let quantity = 0;
    subscriptionList?.forEach((subscription: SubscriptionItem) => {
      if (subscription && product) {
        const productId = getProductId(
          subscription.type,
          subscription.support,
          subscription.sla
        );
        if (productId === product?.product.id && product?.price !== undefined) {
          quantity = subscription.quantity;
        }
      }
    });
    return quantity;
  };

  const checkoutProduct = products?.map((product: ChannelProduct) => {
    const prod = {
      longId: product.product.id,
      marketplace: product.marketplace,
      id: offer?.id ?? "",
      name: product.product.name,
      price: {
        value: Number(product.price),
        discount: Number(offer?.discount) ?? 0,
      },
      period: duration as UserSubscriptionPeriod | Durations,
    };
    return {
      product: prod as Product,
      quantity: getProductQauntity(product),
    };
  });

  const shopCheckoutData = {
    products: checkoutProduct,
    action: "offer",
  };

  return (
    <>
      <Button
        appearance="positive"
        className="u-no-margin--bottom order-checkout-button"
        onClick={(e) => {
          e.preventDefault();
          localStorage.setItem(
            "shop-checkout-data",
            JSON.stringify(shopCheckoutData)
          );
          location.href = "/account/checkout";
        }}
      >
        Checkout
      </Button>
    </>
  );
};

export default DistributorBuyButton;
