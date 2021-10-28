import React, { useState } from "react";
import { Button } from "@canonical/react-components";
import { ReactQueryDevtools } from "react-query/devtools";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import CubePurchaseModal from "../CubePurchaseModal";

type Props = {
  productName: string;
  productListingId: string;
  buttonText?: string;
  buttonAppearance?: string;
};

const CubePurchase = ({
  productName,
  productListingId,
  buttonText = "Purchase",
  buttonAppearance = "positive",
}: Props) => {
  const [modalOpen, setModalOpen] = useState(false);
  const closeHandler = () => setModalOpen(false);
  const stripePromise = loadStripe(window.stripePublishableKey ?? "");

  return (
    <>
      <Button appearance={buttonAppearance} onClick={() => setModalOpen(true)}>
        {buttonText}
      </Button>
      {modalOpen ? (
        <>
          <Elements stripe={stripePromise}>
            <CubePurchaseModal
              productName={productName}
              productListingId={productListingId}
              closeHandler={closeHandler}
            />
          </Elements>
          <ReactQueryDevtools initialIsOpen={false} />
        </>
      ) : null}
    </>
  );
};

export default CubePurchase;
