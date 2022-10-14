import React, { useEffect, useState } from "react";
import { ActionButton } from "@canonical/react-components";
import * as Sentry from "@sentry/react";
import useStripeCustomerInfo from "../../../PurchaseModal/hooks/useStripeCustomerInfo";
import usePurchaseOffer from "../hooks/usePurchaseOffer";
import usePendingPurchase from "../../subscribe/react/hooks/usePendingPurchase";
import { getSessionData } from "../../../utils/getSessionData";
import { BuyButtonProps } from "../../subscribe/react/utils/utils";
import { Offer as OfferType } from "../types";
import { getErrorMessage } from "../../error-handler";

import { checkoutEvent, purchaseEvent } from "../../ecom-events";

type Props = {
  offer: OfferType;
} & BuyButtonProps;

const BuyButton = ({
  offer,
  areTermsChecked,
  isDescriptionChecked,
  isMarketingOptInChecked,
  setTermsChecked,
  setIsMarketingOptInChecked,
  setIsDescriptionChecked,
  setError,
  setStep,
}: Props) => {
  const [isLoading, setIsLoading] = useState(false);

  const {
    data: pendingPurchase,
    setPendingPurchaseID,
    error: purchaseError,
  } = usePendingPurchase();

  const { data: userInfo } = useStripeCustomerInfo();

  const purchaseMutation = usePurchaseOffer();

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

  const GAFriendlyProduct = {
    id: offer.id,
    name: offer.items[0].name,
    price: offer.total / 100,
    quantity: 1,
  };

  const onPayClick = () => {
    setIsLoading(true);
    checkoutEvent(GAFriendlyProduct, "3");
    purchaseMutation.mutate(
      {
        offerId: offer.id,
        marketplace: offer.marketplace,
        accountId: offer.account_id,
      },
      {
        onSuccess: (data) => {
          //start polling
          setPendingPurchaseID(data);
        },
        onError: (error) => {
          setTermsChecked(false);
          setIsDescriptionChecked(false);
          setIsMarketingOptInChecked(false);
          setIsLoading(false);
          if (
            error instanceof Error &&
            error.message.includes("purchased already")
          ) {
            setError(<>This offer has already been purchased.</>);
          } else if (
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
                <a href="https://ubuntu.com/contact-us">Canonical sales</a> if
                the problem persists.
              </>
            );
          }
        },
      }
    );
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
          location.href = `/advantage`;
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
