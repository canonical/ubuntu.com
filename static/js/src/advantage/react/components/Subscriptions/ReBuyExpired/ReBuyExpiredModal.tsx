import React from "react";
import { UserSubscription } from "advantage/api/types";
import {
  Product,
  Periods,
  BuyButtonProps,
} from "advantage/subscribe/react/utils/utils";

type Props = {
  subscription: UserSubscription;
  closeModal: () => void;
};

import PurchaseModal from "PurchaseModal";
import Summary from "./Summary/Summary";
import ReBuyExpiredButton from "./ReBuyExpiredButton";
import usePreview from "advantage/subscribe/react/hooks/usePreview";
import { useLastPurchaseIds } from "advantage/react/hooks";
import { selectPurchaseIdsByMarketplaceAndPeriod } from "advantage/react/hooks/useLastPurchaseIds";

const ReBuyExpiredModal = ({ subscription, closeModal }: Props) => {
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

  const price: number = subscription.price || 0;
  const product: Product = {
    canBeTrialled: false,
    longId: subscription.listing_id || "",
    name: subscription.product_name || "",
    period: Periods.yearly,
    price: {
      value: price / subscription.number_of_machines,
      currency: "USD",
    },
    private: false,
    id: "physical-uai-essential-weekday-yearly", // does not matter
    productID: "",
    marketplace: "canonical-ua",
  };

  const { data: lastPurchaseId } = useLastPurchaseIds(
    subscription?.account_id,
    {
      select: selectPurchaseIdsByMarketplaceAndPeriod(
        subscription?.marketplace,
        subscription?.period
      ),
    }
  );

  window.previousPurchaseIds = {
    monthly: "",
    yearly: lastPurchaseId || "",
  };

  const { data: preview } = usePreview({
    quantity: subscription.current_number_of_machines,
    product,
  });
  const ReBuyExpiredSummary = () => {
    return (
      <Summary
        quantity={subscription.current_number_of_machines}
        product={product}
      />
    );
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
        quantity={subscription.current_number_of_machines}
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
          accountId={subscription.account_id}
          termsLabel={termsLabel}
          descriptionLabel={descriptionLabel}
          marketingLabel={marketingLabel}
          product={product}
          preview={preview}
          quantity={subscription.current_number_of_machines}
          closeModal={closeModal}
          Summary={ReBuyExpiredSummary}
          BuyButton={BuyButton}
          modalTitle={`Renew ${subscription.product_name}`}
          marketplace="canonical-ua"
        />
      </div>
    </div>
  );
};

export default ReBuyExpiredModal;
