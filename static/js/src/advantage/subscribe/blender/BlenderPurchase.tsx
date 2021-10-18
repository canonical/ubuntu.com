import React from "react";
import PurchaseModal from "../../../PurchaseModal";
import usePreview from "../../subscribe/react/hooks/usePreview";
import Summary from "./Summary";
import BuyButton from "./BuyButton";

const BlenderPurchase = () => {
  const { data: preview } = usePreview();

  const termsLabel = (
    <>
      I agree to the{" "}
      <a
        href="/legal/ubuntu-advantage-service-terms"
        target="_blank"
        rel="noopener noreferrer"
      >
        Ubuntu Advantage service terms
      </a>
    </>
  );

  const closeModal = () => {
    const purchaseModal = document.querySelector("#purchase-modal");
    purchaseModal?.classList.add("u-hide");
  };

  return (
    <PurchaseModal
      termsLabel={termsLabel}
      product={window.STATE.product}
      preview={preview}
      quantity={window.STATE.quantity}
      closeModal={closeModal}
      Summary={Summary}
      BuyButton={BuyButton}
      marketplace="blender"
    />
  );
};

export default BlenderPurchase;
