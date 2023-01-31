import React from "react";
import { Button } from "@canonical/react-components";
import { Product } from "advantage/subscribe/checkout/utils/types";

type Prop = {
  product: Product;
};

export default function PaymentButton({ product }: Prop) {
  const shopCheckoutData = {
    product: product,
    quantity: 1,
    action: "offer",
  };

  return (
    <>
      <Button
        appearance="positive"
        className="u-no-margin--bottom"
        onClick={(e) => {
          e.preventDefault();
          localStorage.setItem(
            "shop-checkout-data",
            JSON.stringify(shopCheckoutData)
          );
          location.href = "/account/checkout";
        }}
      >
        Purchase
      </Button>
    </>
  );
}
