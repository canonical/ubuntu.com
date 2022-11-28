import { Button, Modal } from "@canonical/react-components";
import React, { useContext } from "react";
import usePortal from "react-useportal";
import PurchaseModal from "../../../../../PurchaseModal";
import usePreview from "advantage/subscribe/react/hooks/usePreview";
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
          <Modal close={closePortal}>
            <PurchaseModal
              termsLabel={termsLabel}
              marketingLabel={marketingLabel}
              descriptionLabel={descriptionLabel}
              product={product}
              preview={preview}
              quantity={quantity}
              closeModal={closePortal}
              Summary={Summary}
              BuyButton={BuyButton}
              marketplace="blender"
            />
          </Modal>
        </Portal>
      ) : null}
    </>
  );
}
