import React, { useContext } from "react";
import { Button } from "@canonical/react-components";
import { FormContext } from "../../utils/FormContext";

export default function PaymentButton(referrer: { referrer: string | null }) {
  const { quantity, product } = useContext(FormContext);
  const referrerValue = referrer ? referrer.referrer : "";
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
          location.href = referrerValue
            ? `/account/checkout?referrer=${referrerValue}`
            : "/account/checkout";
        }}
      >
        Buy now
      </Button>
    </>
  );
}
