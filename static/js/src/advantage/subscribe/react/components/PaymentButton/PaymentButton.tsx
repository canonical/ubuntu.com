import React, { useContext } from "react";
import { FormContext } from "../../utils/FormContext";
import { VButton } from "@canonical/vanilla-web-components/react-components";

export default function PaymentButton() {
  const { quantity, product } = useContext(FormContext);

  const shopCheckoutData = {
    product: product,
    quantity: Number(quantity) ?? 0,
    action: "purchase",
  };

  return (
    <>
      <VButton
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
      </VButton>
    </>
  );
}
