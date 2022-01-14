import React, { useEffect, useState } from "react";
import { ActionButton } from "@canonical/react-components";
import * as Sentry from "@sentry/react";
import usePurchaseOffer from "../hooks/usePurchaseOffer";
import usePendingPurchase from "../../subscribe/react/hooks/usePendingPurchase";
import { getSessionData } from "../../../utils/getSessionData";
import { BuyButtonProps } from "../../subscribe/react/utils/utils";

import { checkoutEvent, purchaseEvent } from "../../ecom-events";

const BuyButton = ({
  areTermsChecked,
  isMarketingOptInChecked,
  setTermsChecked,
  setIsMarketingOptInChecked,
  setError,
  setStep,
}: BuyButtonProps) => {
  const [isLoading, setIsLoading] = useState(false);

  const purchaseMutation = usePurchaseOffer();

  const onPayClick = () => {
    setIsLoading(true);
    // checkoutEvent(GAFriendlyProduct, "3");
    purchaseMutation.mutate(undefined, {
      onSuccess: (data) => {
        //start polling
        // setPendingPurchaseID(data);
      },
      onError: (error) => {
        setTermsChecked(false);
        setIsMarketingOptInChecked(false);
        setIsLoading(false);
        if (
          error instanceof Error &&
          error.message.includes("can only make one purchase at a time")
        ) {
          setError(
            <>
              You already have a pending purchase. Please go to{" "}
              <a href="/account/payment-methods">payment methods</a> to retry.
            </>
          );
        } else {
          Sentry.captureException(error);
          setError(
            <>
              Sorry, there was an unknown error with the payment. Check the
              details and try again. Contact{" "}
              <a href="https://ubuntu.com/contact-us">Canonical sales</a> if the
              problem persists.
            </>
          );
        }
      },
    });
  };

  return (
    <ActionButton
      className="col-small-2 col-medium-2 col-3 u-no-margin"
      appearance="positive"
      aria-label="Buy"
      style={{ textAlign: "center" }}
      disabled={!areTermsChecked || isLoading}
      onClick={onPayClick}
      loading={isLoading}
    >
      Buy
    </ActionButton>
  );
};

export default BuyButton;
