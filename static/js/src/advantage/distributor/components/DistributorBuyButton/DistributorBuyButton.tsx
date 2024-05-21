import React, { useContext } from "react";
import { Button } from "@canonical/react-components";
import { FormContext } from "advantage/distributor/utils/FormContext";

const DistributorBuyButton = () => {
  const { products } = useContext(FormContext);
  const channelCheckoutData = {
    products: products,
  };

  return (
    <>
      <Button
        appearance="positive"
        className="u-no-margin--bottom order-checkout-button"
        onClick={(e) => {
          e.preventDefault();
          localStorage.setItem(
            "channel-checkout-data",
            JSON.stringify(channelCheckoutData)
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
