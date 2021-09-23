import React, { useEffect, useState } from "react";
import useProduct from "./APICalls/useProduct";
import PurchaseModal from "./PurchaseModal";

const UAPurchase = () => {
  const { product, quantity } = useProduct();

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

  const closeModal = window.handleTogglePurchaseModal;

  return (
    <PurchaseModal
      termsLabel={termsLabel}
      product={product}
      quantity={quantity}
      closeModal={closeModal}
    />
  );
};

export default UAPurchase;
