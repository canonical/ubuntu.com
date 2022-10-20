import { Button } from "@canonical/react-components";
import React, { useContext } from "react";
import usePortal from "react-useportal";
import PurchaseModal from "../../../../../PurchaseModal";
import usePreview from "../../hooks/usePreview";
import { FormContext } from "../../utils/FormContext";
import Summary from "../Summary";

type Props = {
  isHidden: boolean;
};

export default function PaymentModal({ isHidden }: Props) {
  const { openPortal, closePortal, isOpen, Portal } = usePortal();
  const { quantity, product } = useContext(FormContext);
  const sanitisedQuantity = Number(quantity) ?? 0;
  const { data: preview } = usePreview({
    quantity: sanitisedQuantity,
    product,
  });

  const termsLabel = (
    <>
      I agree to the{" "}
      <a
        href="/legal/ubuntu-advantage-service-terms"
        target="_blank"
        rel="noopener noreferrer"
      >
        Ubuntu Pro service terms
      </a>
    </>
  );

  const marketingLabel =
    "I agree to receive information about Canonical's products and services";

  return (
    <>
      <Button appearance="positive" disabled={isHidden} onClick={openPortal}>
        Buy now
      </Button>
      {isOpen ? (
        <Portal>
          <PurchaseModal
            termsLabel={termsLabel}
            marketingLabel={marketingLabel}
            product={product}
            preview={preview}
            quantity={sanitisedQuantity}
            closeModal={closePortal}
            Summary={Summary}
            marketplace="canonical-ua"
          />
        </Portal>
      ) : null}
    </>
  );
}
