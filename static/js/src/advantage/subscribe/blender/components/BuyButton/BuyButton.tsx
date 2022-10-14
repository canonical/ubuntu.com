import React, { useContext, useEffect, useState } from "react";
import { ActionButton } from "@canonical/react-components";
import * as Sentry from "@sentry/react";
import useStripeCustomerInfo from "../../../../../PurchaseModal/hooks/useStripeCustomerInfo";
import usePurchase from "advantage/subscribe/react/hooks/usePurchase";
import usePendingPurchase from "advantage/subscribe/react/hooks/usePendingPurchase";
import { getSessionData } from "../../../../../utils/getSessionData";
import { BuyButtonProps } from "advantage/subscribe/react/utils/utils";

import { getErrorMessage } from "../../../../error-handler";

import { checkoutEvent, purchaseEvent } from "../../../../ecom-events";
import { FormContext } from "../../utils/FormContext";

const BuyButton = ({
  areTermsChecked,
  isDescriptionChecked,
  isMarketingOptInChecked,
  setTermsChecked,
  setIsMarketingOptInChecked,
  setIsDescriptionChecked,
  setError,
  setStep,
}: BuyButtonProps) => {
  const [isLoading, setIsLoading] = useState(false);

  const [sessionData, setSessionData] = useState({
    gclid: "",
    utm_campaign: "",
    utm_source: "",
    utm_medium: "",
  });

  useEffect(() => {
    setSessionData({
      gclid: getSessionData("gclid"),
      utm_campaign: getSessionData("utm_campaign"),
      utm_source: getSessionData("utm_source"),
      utm_medium: getSessionData("utm_medium"),
    });
  }, []);

  const { data: userInfo } = useStripeCustomerInfo();
  const { quantity, product } = useContext(FormContext);

  const purchaseMutation = usePurchase({ quantity, product });

  const {
    data: pendingPurchase,
    setPendingPurchaseID,
    error: purchaseError,
  } = usePendingPurchase();

  const GAFriendlyProduct = {
    id: product?.id,
    name: product?.name,
    price: (product?.price?.value ?? 0) / 100,
    quantity: quantity,
  };

  const handleOnPurchaseBegin = () => {
    // empty the product selector state persisted in the local storage
    // after the user chooses to make a purchase
    // to prevent page refreshes from causing accidental double purchasing
    setIsLoading(true);
  };

  const handleOnAfterPurchaseSuccess = () => {
    if (window.isGuest && !window.isLoggedIn) {
      location.href = `/pro/subscribe/blender/thank-you?email=${encodeURIComponent(
        userInfo?.customerInfo?.email
      )}`;
    } else {
      location.pathname = "/pro";
    }
  };

  const onPayClick = () => {
    handleOnPurchaseBegin();
    checkoutEvent(GAFriendlyProduct, "3");
    purchaseMutation.mutate(undefined, {
      onSuccess: (data) => {
        //start polling
        setPendingPurchaseID(data);
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

  useEffect(() => {
    // the initial call was successful but it returned an error while polling the purchase status
    if (purchaseError) {
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
      setIsDescriptionChecked(false);
      setIsMarketingOptInChecked(false);
      setStep(1);
    }
  }, [purchaseError]);

  useEffect(() => {
    if (pendingPurchase?.status === "done") {
      const purchaseInfo = {
        id: pendingPurchase?.id,
        origin: "Blender Shop",
        total: pendingPurchase?.invoice?.total / 100,
        tax: pendingPurchase?.invoice?.taxAmount / 100,
      };

      purchaseEvent(purchaseInfo, GAFriendlyProduct);

      const request = new XMLHttpRequest();
      const formData = new FormData();
      formData.append("formid", "3756");
      formData.append("email", userInfo?.customerInfo?.email ?? "");
      formData.append("Consent_to_Processing__c", "yes");
      formData.append("GCLID__c", sessionData?.gclid || "");
      formData.append("utm_campaign", sessionData?.utm_campaign || "");
      formData.append("utm_source", sessionData?.utm_source || "");
      formData.append("utm_medium", sessionData?.utm_medium || "");
      formData.append("store_name__c", "blender");
      formData.append(
        "canonicalUpdatesOptIn",
        isMarketingOptInChecked ? "yes" : "no"
      );

      request.open("POST", "/marketo/submit");
      request.send(formData);

      request.onreadystatechange = () => {
        if (request.readyState === 4) {
          handleOnAfterPurchaseSuccess();
        }
      };
    }
  }, [pendingPurchase]);

  return (
    <ActionButton
      className="col-small-2 col-medium-2 col-3 u-no-margin"
      appearance="positive"
      aria-label="Buy"
      style={{ textAlign: "center" }}
      disabled={!areTermsChecked || !isDescriptionChecked || isLoading}
      onClick={onPayClick}
      loading={isLoading}
    >
      Buy
    </ActionButton>
  );
};

export default BuyButton;
