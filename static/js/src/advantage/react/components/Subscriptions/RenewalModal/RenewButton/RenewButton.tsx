import React, { useEffect, useState } from "react";
import { ActionButton } from "@canonical/react-components";
import * as Sentry from "@sentry/react";
import useStripeCustomerInfo from "../../../../../../PurchaseModal/hooks/useStripeCustomerInfo";
import useRenewal from "../../../../hooks/useRenewal";
import usePendingRenewal from "../../../../hooks/usePendingRenewal";
import { getSessionData } from "../../../../../../utils/getSessionData";
import { useQueryClient } from "react-query";
import { BuyButtonProps } from "../../../../../subscribe/react/utils/utils";
import { getErrorMessage } from "../../../../../../advantage/error-handler";

type Props = {
  renewalID: string | null;
  closeModal: () => void;
} & BuyButtonProps;

const BuyButton = ({
  renewalID,
  closeModal,
  areTermsChecked,
  isMarketingOptInChecked,
  isDescriptionChecked,
  setTermsChecked,
  setIsMarketingOptInChecked,
  setIsDescriptionChecked,
  setError,
  setStep,
}: Props) => {
  const [isLoading, setIsLoading] = useState(false);
  const queryClient = useQueryClient();

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

  const renewalMutation = useRenewal();

  const {
    data: pendingRenewal,
    setPendingRenewalID,
    error: renewalError,
  } = usePendingRenewal();

  const handleOnRenewalBegin = () => {
    setIsLoading(true);
  };

  const onPayClick = () => {
    handleOnRenewalBegin();
    renewalMutation.mutate(renewalID, {
      onSuccess: () => {
        //start polling
        setPendingRenewalID(renewalID);
      },
      onError: (error) => {
        setIsLoading(false);
        if (
          error instanceof Error &&
          error.message.includes("can only make one Renewal at a time")
        ) {
          setError(
            <>
              You already have a pending Renewal. Please go to{" "}
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
    // the initial call was successful but it returned an error while polling the Renewal status
    if (renewalError instanceof Error) {
      setIsLoading(false);
      if (
        renewalError.message.includes(
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
        const knownError = getErrorMessage(renewalError);

        if (!knownError) {
          Sentry.captureException(renewalError);
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
  }, [renewalError]);

  useEffect(() => {
    if (pendingRenewal?.status === "done") {
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
          //Renewal was successful we refresh the view
          queryClient.invalidateQueries("userSubscriptions");
          closeModal();
        }
      };
    }
  }, [pendingRenewal]);

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
      Renew
    </ActionButton>
  );
};

export default BuyButton;
