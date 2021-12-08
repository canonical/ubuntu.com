import React from "react";
import { Modal } from "@canonical/react-components";
import PurchaseModal from "../../../PurchaseModal";
import { BuyButtonProps } from "../../../PurchaseModal/utils/utils";
import Summary from "../Summary";
import CubeBuyButton from "../CubeBuyButton";
import usePreview from "../../hooks/usePreview";

type Props = {
  productName: string;
  productListingId: string;
  closeHandler: () => void;
};

const CubePurchaseModal = ({
  productName,
  productListingId,
  closeHandler,
}: Props) => {
  // Fetch preview data so that the user doesn't have to wait for it on the
  // second modal view
  usePreview(productListingId);

  const termsLabel = (
    <>
      I agree to the{" "}
      <a
        href="/legal/terms-and-policies/cube-terms"
        target="_blank"
        rel="noopener noreferrer"
      >
        CUBE service terms
      </a>
    </>
  );

  const marketingLabel =
    "I agree to receive information about Canonical's products and services";

  const summary = () => <Summary productListingId={productListingId} />;

  const buyButton = ({ ...props }: BuyButtonProps) => (
    <CubeBuyButton productListingId={productListingId} {...props} />
  );

  const quantity = 1;

  return (
    <Modal
      className="p-modal--ua-payment"
      style={{ textAlign: "initial" }}
      close={closeHandler}
    >
      <PurchaseModal
        modalTitle="Complete purchase"
        marketplace="canonical-cube"
        termsLabel={termsLabel}
        marketingLabel={marketingLabel}
        isFreeTrialApplicable={false}
        product={productName}
        quantity={quantity}
        closeModal={closeHandler}
        Summary={summary}
        BuyButton={buyButton}
      />
    </Modal>
  );
};

export default CubePurchaseModal;
