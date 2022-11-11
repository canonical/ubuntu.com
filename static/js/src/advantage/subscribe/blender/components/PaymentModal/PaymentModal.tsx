import { Button } from "@canonical/react-components";
import React, { useContext } from "react";
import usePortal from "react-useportal";
import PurchaseModal from "../../../../../PurchaseModal";
import { FormContext } from "../../utils/FormContext";
import Summary from "../Summary";

type Props = {
  isHidden: boolean;
};

export default function PaymentModal({ isHidden }: Props) {
  const { openPortal, closePortal, isOpen, Portal } = usePortal();
  const { quantity, product } = useContext(FormContext);

  const termsLabel = (
    <>
      I agree to the{" "}
      <a
        href="/legal/ubuntu-advantage-service-terms"
        target="_blank"
        rel="noopener norefferer"
      >
        Ubuntu Pro terms
      </a>
      , which apply to the{" "}
      <a href="/legal/solution-support">Solution Support</a> service.
    </>
  );

  const descriptionLabel = (
    <>
      I agree to the{" "}
      <a
        href="/legal/ubuntu-pro-description"
        target="_blank"
        rel="noopener norefferer"
      >
        Ubuntu Pro description
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
            descriptionLabel={descriptionLabel}
            marketingLabel={marketingLabel}
            product={product}
            quantity={quantity}
            closeModal={closePortal}
            Summary={Summary}
          />
        </Portal>
      ) : null}
    </>
  );
}
