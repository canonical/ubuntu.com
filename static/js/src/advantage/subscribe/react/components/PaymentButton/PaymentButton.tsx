import React, { useContext } from "react";
import { Button } from "@canonical/react-components";
import { FormContext } from "../../utils/FormContext";

export default function PaymentButton() {
  const { quantity, product } = useContext(FormContext);

  const shopCheckoutData = {
    product: product,
    quantity: Number(quantity) ?? 0,
    action: "purchase",
  };

  return (
    <>
      <Button
        appearance="positive"
        onClick={(e) => {
          e.preventDefault();
          localStorage.setItem(
            "shop-checkout-data",
            JSON.stringify(shopCheckoutData)
          );
          location.href = "/account/checkout";
        }}
      >
        Buy now
      </Button>
    </>
  );
}
