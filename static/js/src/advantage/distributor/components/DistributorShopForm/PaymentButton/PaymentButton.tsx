import React from "react";
import { Button } from "@canonical/react-components";

export default function PaymentButton() {
  return (
    <Button
      appearance="positive"
      className="u-no-margin--bottom"
      onClick={(e) => {
        e.preventDefault();
        location.href = "/pro/distributor/order";
      }}
    >
      Proceed to checkout
    </Button>
  );
}
