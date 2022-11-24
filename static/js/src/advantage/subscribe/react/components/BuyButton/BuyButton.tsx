import React, { useContext, useEffect, useState } from "react";
import { ActionButton } from "@canonical/react-components";
import * as Sentry from "@sentry/react";
import useStripeCustomerInfo from "../../../../../PurchaseModal/hooks/useStripeCustomerInfo";
import usePurchase from "../../hooks/usePurchase";
import useFreeTrial from "../../hooks/useFreeTrial";
import usePendingPurchase from "../../hooks/usePendingPurchase";
import { getSessionData } from "../../../../../utils/getSessionData";
import { BuyButtonProps } from "../../utils/utils";
import { getErrorMessage } from "../../../../error-handler";

import { checkoutEvent, purchaseEvent } from "../../../../ecom-events";
import { FormContext } from "../../utils/FormContext";

const BuyButton = ({
  areTermsChecked,
  isDescriptionChecked,
  isUsingFreeTrial,
  isMarketingOptInChecked,
  setTermsChecked,
  setIsDescriptionChecked,
  setIsMarketingOptInChecked,
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

  const SanitisedQuantity = Number(quantity) ?? 0;

  const purchaseMutation = usePurchase({
    quantity: SanitisedQuantity,
    product,
  });

  const freeTrialMutation = useFreeTrial();

  const {
    data: pendingPurchase,
    setPendingPurchaseID,
    error: purchaseError,
  } = usePendingPurchase();

  const GAFriendlyProduct = {
    id: product?.id,
    name: product?.name,
    price: (product?.price?.value ?? 0) / 100,
    quantity: SanitisedQuantity,
  };

  const handleOnPurchaseBegin = () => {
    // empty the product selector state persisted in the local storage
    // after the user chooses to make a purchase
    // to prevent page refreshes from causing accidental double purchasing
    localStorage.removeItem("ua-subscribe-state");
    setIsLoading(true);
  };

  const handleOnAfterPurchaseSuccess = () => {
    if (window.isGuest && !window.isLoggedIn) {
      location.href = `/pro/subscribe/thank-you?email=${encodeURIComponent(
        userInfo?.customerInfo?.email
      )}`;
    } else {
      location.pathname = "/pro";
    }
  };

  const onStartTrialClick = () => {
    handleOnPurchaseBegin();

    freeTrialMutation.mutate(undefined, {
      onSuccess: () => {
        handleOnAfterPurchaseSuccess();
      },
      onError: (error) => {
        setIsLoading(false);
        if (
          error instanceof Error &&
          error.message.includes("account already had or has access to product")
        ) {
          setError(<>You already have trialled this product</>);
        } else {
          Sentry.captureException(error);
          setError(
            <>
              Sorry, there was an unknown error with the free trial. Check the
              details and try again. Contact{" "}
              <a href="https://ubuntu.com/contact-us">Canonical sales</a> if the
              problem persists.
            </>
          );
        }
      },
    });
  };

  const proSelectorStates = [
    "pro-selector-productType",
    "pro-selector-version",
    "pro-selector-quantity",
    "pro-selector-feature",
    "pro-selector-support",
    "pro-selector-sla",
    "pro-selector-period",
    "pro-selector-publicCloud",
  ];

  const onPayClick = () => {
    handleOnPurchaseBegin();
    checkoutEvent(GAFriendlyProduct, "3");
    purchaseMutation.mutate(undefined, {
      onSuccess: (data) => {
        //start polling
        setPendingPurchaseID(data);
        proSelectorStates.forEach((state) => localStorage.removeItem(state));
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
        } else if (
          error instanceof Error &&
          error.message.includes("invalid VAT")
        ) {
          setError(
            "That VAT number is invalid. Check the number and try again."
          );
        } else if (
          error instanceof Error &&
          error.message.includes("validate your VAT")
        ) {
          setError(
            <>
              VAT number could not be validated at this time, please try again
              later or contact
              <a href="mailto:customersuccess@canonical.com">
                customer success
              </a>{" "}
              if the problem persists.
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
        origin: "UA Shop",
        total: pendingPurchase?.invoice?.total / 100,
        tax: pendingPurchase?.invoice?.taxAmount / 100,
      };

      purchaseEvent(purchaseInfo, GAFriendlyProduct);

      // The state of the product selector is stored in the local storage
      // if a purchase is successful we empty it so the customer will see
      // the default values pre-selected instead of what they just bought.
      localStorage.removeItem("ua-subscribe-state");

      const request = new XMLHttpRequest();
      const formData = new FormData();
      formData.append("formid", "3756");
      formData.append("email", userInfo?.customerInfo?.email ?? "");
      formData.append("Consent_to_Processing__c", "yes");
      formData.append("GCLID__c", sessionData?.gclid || "");
      formData.append("utm_campaign", sessionData?.utm_campaign || "");
      formData.append("utm_source", sessionData?.utm_source || "");
      formData.append("utm_medium", sessionData?.utm_medium || "");
      formData.append("store_name__c", "ua");
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
      onClick={isUsingFreeTrial ? onStartTrialClick : onPayClick}
      loading={isLoading}
    >
      Buy
    </ActionButton>
  );
};

export default BuyButton;
