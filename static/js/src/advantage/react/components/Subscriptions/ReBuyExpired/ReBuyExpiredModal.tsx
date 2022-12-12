import React from "react";
import {
  Product,
  Periods,
  BuyButtonProps,
} from "advantage/subscribe/react/utils/utils";

type Props = {
  repurchase: {
    accountId: string;
    listingId: string;
    units: number;
    total: number;
    productName: string;
    marketplace: UserSubscriptionMarketplace;
    period: UserSubscriptionPeriod;
  };
  closeModal: () => void;
};

import PurchaseModal from "PurchaseModal";
import Summary from "./Summary/Summary";
import ReBuyExpiredButton from "./ReBuyExpiredButton";
import usePreview from "advantage/subscribe/react/hooks/usePreview";
import { useLastPurchaseIds } from "advantage/react/hooks";
import { selectPurchaseIdsByMarketplaceAndPeriod } from "advantage/react/hooks/useLastPurchaseIds";
import {
  UserSubscriptionMarketplace,
  UserSubscriptionPeriod,
} from "advantage/api/enum";

const ReBuyExpiredModal = ({ repurchase, closeModal }: Props) => {
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

  const descriptionLabel = (
    <>
      I agree to the{" "}
      <a
        href="/legal/ubuntu-pro-description"
        target="_blank"
        rel="noopener noreferrer"
      >
        Ubuntu Pro description
      </a>
    </>
  );

  const marketingLabel =
    "I agree to receive information about Canonical's products and services";

  const price: number = repurchase.total || 0;
  const product: Product = {
    canBeTrialled: false,
    longId: repurchase.listingId || "",
    name: repurchase.productName || "",
    period: Periods.yearly,
    price: {
      value: price / repurchase.units,
      currency: "USD",
    },
    private: false,
    id: "physical-uai-essential-weekday-yearly", // does not matter
    productID: "",
    marketplace: "canonical-ua",
  };

  const { data: lastPurchaseId } = useLastPurchaseIds(repurchase.accountId, {
    select: selectPurchaseIdsByMarketplaceAndPeriod(
      repurchase.marketplace,
      repurchase.period
    ),
  });

  window.previousPurchaseIds = {
    monthly: "",
    yearly: lastPurchaseId || "",
  };

  const { data: preview } = usePreview({
    quantity: repurchase.units,
    product,
  });
  const ReBuyExpiredSummary = () => {
    return <Summary quantity={repurchase.units} product={product} />;
  };

  const BuyButton = ({
    areTermsChecked,
    isDescriptionChecked,
    isMarketingOptInChecked,
    setTermsChecked,
    setIsMarketingOptInChecked,
    setIsDescriptionChecked,
    setError,
    setStep,
    isUsingFreeTrial,
  }: BuyButtonProps) => {
    return (
      <ReBuyExpiredButton
        quantity={repurchase.units}
        product={product}
        areTermsChecked={areTermsChecked}
        isMarketingOptInChecked={isMarketingOptInChecked}
        isDescriptionChecked={isDescriptionChecked}
        setTermsChecked={setTermsChecked}
        setIsMarketingOptInChecked={setIsMarketingOptInChecked}
        setIsDescriptionChecked={setIsDescriptionChecked}
        setError={setError}
        setStep={setStep}
        isUsingFreeTrial={isUsingFreeTrial}
      />
    );
  };

  return (
    <div
      className="p-modal p-modal--ua-payment is-details-mode"
      id="purchase-modal"
    >
      <div
        id="react-root"
        className="p-modal__dialog ua-dialog"
        role="dialog"
        aria-labelledby="modal-title"
      >
        <PurchaseModal
          accountId={repurchase.accountId}
          termsLabel={termsLabel}
          descriptionLabel={descriptionLabel}
          marketingLabel={marketingLabel}
          product={product}
          preview={preview}
          quantity={repurchase.units}
          closeModal={closeModal}
          Summary={ReBuyExpiredSummary}
          BuyButton={BuyButton}
          modalTitle={`Renew ${repurchase.productName}`}
          marketplace="canonical-ua"
        />
      </div>
    </div>
  );
};

export default ReBuyExpiredModal;
