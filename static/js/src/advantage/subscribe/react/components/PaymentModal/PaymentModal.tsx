import { Button, Modal } from "@canonical/react-components";
import React, { useContext } from "react";
import usePortal from "react-useportal";
import PurchaseModal from "../../../../../PurchaseModal";
import usePreview from "../../hooks/usePreview";
import { FormContext } from "../../utils/FormContext";
import BuyButton from "../BuyButton";
import Summary from "../Summary";

type Props = {
  isHidden: boolean;
};

export default function PaymentModal({ isHidden }: Props) {
  const { openPortal, closePortal, isOpen, Portal } = usePortal();
  const { quantity, product } = useContext(FormContext);
  const { data: preview } = usePreview({ quantity, product });

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

  const marketingLabel =
    "I agree to receive information about Canonical's products and services";

  return (
    <>
      <Button appearance="positive" disabled={isHidden} onClick={openPortal}>
        Buy now
      </Button>
      {isOpen ? (
        <Portal>
          <Modal close={closePortal}>
            <PurchaseModal
              termsLabel={termsLabel}
              marketingLabel={marketingLabel}
              product={product}
              preview={preview}
              quantity={quantity}
              closeModal={closePortal}
              Summary={Summary}
              BuyButton={BuyButton}
              isFreeTrialApplicable={true}
              marketplace="canonical-ua"
            />
          </Modal>
        </Portal>
      ) : null}
    </>
  );
}
