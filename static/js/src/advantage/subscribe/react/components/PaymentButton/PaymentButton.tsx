import React, { useContext } from "react";
import { Button } from "@canonical/react-components";
import { FormContext } from "../../utils/FormContext";

export default function PaymentButton() {
  const {
    quantity,
    product,
    productType,
    version,
    support,
    feature,
    sla,
    period,
  } = useContext(FormContext);

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
          window.plausible("proSelector", {
            props: {
              productType: productType,
              quantity: quantity,
              version: version,
              feature: feature,
              support: support,
              sla: sla,
              period: period,
            },
          });
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
