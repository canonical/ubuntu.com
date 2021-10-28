import React, { useEffect, useState } from "react";
import { ActionButton } from "@canonical/react-components";
import * as Sentry from "@sentry/react";
import { BuyButtonProps } from "../../../PurchaseModal/utils/utils";
import { getErrorMessage } from "../../../advantage/error-handler";
import usePurchase from "../../hooks/usePurchase";
import usePendingPurchase from "../../hooks/usePendingPurchase";

export type Props = BuyButtonProps & { productListingId: string };

const CubeBuyButton = ({
  areTermsChecked,
  setTermsChecked,
  setError,
  setStep,
  productListingId,
}: Props) => {
  const [isLoading, setIsLoading] = useState(false);

  const purchaseMutation = usePurchase(productListingId);

  const {
    data: pendingPurchase,
    setPendingPurchaseId,
    error: purchaseError,
  } = usePendingPurchase();

  const handleOnAfterPurchaseSuccess = () => {
    location.reload();
  };

  const onPayClick = () => {
    setIsLoading(true);

    purchaseMutation.mutate(undefined, {
      onSuccess: (data) => {
        //start polling
        setPendingPurchaseId(data);
      },
      onError: (error) => {
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
              Sorry, there was an unknown error with with the payment. Check the
              details and try again. Contact{" "}
              <a href="https://ubuntu.com/contact-us">Canonical sales</a> if the
              problem persists.
            </>
          );
        }
      },
    });
  };

  useEffect(() => {
    // the initial call was successful but it returned an error while polling the purchase status
    if (purchaseError instanceof Error) {
      setIsLoading(false);
      if (
        purchaseError.message.includes(
          "We are unable to authenticate your payment method"
        )
      ) {
        setError(
          <>
            We were unable to verify your credit card. Check the details and try
            again. Contact{" "}
            <a href="https://ubuntu.com/contact-us">Canonical sales</a> if the
            problem persists.
          </>
        );
      } else {
        const knownError = getErrorMessage(purchaseError);

        if (!knownError) {
          Sentry.captureException(purchaseError);
          setError(
            <>
              We were unable to process the payment. Check the details and try
              again. Contact{" "}
              <a href="https://ubuntu.com/contact-us">Canonical sales</a> if the
              problem persists.
            </>
          );
        } else {
          setError(knownError);
        }
      }
      setTermsChecked(false);
      setStep(1);
    }
  }, [purchaseError]);

  useEffect(() => {
    if (pendingPurchase?.status === "done") {
      handleOnAfterPurchaseSuccess();
    }
  }, [pendingPurchase]);

  return (
    <ActionButton
      className="col-small-2 col-medium-2 col-3 u-no-margin"
      appearance="positive"
      aria-label="Buy"
      style={{ textAlign: "center" }}
      disabled={!areTermsChecked || isLoading}
      loading={isLoading}
      onClick={onPayClick}
    >
      Buy
    </ActionButton>
  );
};

export default CubeBuyButton;
