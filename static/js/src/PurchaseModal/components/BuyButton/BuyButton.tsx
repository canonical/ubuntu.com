import React, { useEffect, useState } from "react";
import { ActionButton } from "@canonical/react-components";
import * as Sentry from "@sentry/react";
import { getSessionData } from "utils/getSessionData";
import { Action, FormValues, Product } from "../../utils/utils";
import { getErrorMessage } from "advantage/error-handler";

import { checkoutEvent, purchaseEvent } from "advantage/ecom-events";
import { useFormikContext } from "formik";
import useMakePurchase from "PurchaseModal/hooks/useMakePurchase";
import useStripeCustomerInfo from "PurchaseModal/hooks/useStripeCustomerInfo";
import usePollPurchaseStatus from "PurchaseModal/hooks/usePollPurchaseStatus";

type Props = {
  setError: React.Dispatch<React.SetStateAction<React.ReactNode>>;
  quantity: number;
  product: Product;
  action: Action;
};

const BuyButton = ({ setError, quantity, product, action }: Props) => {
  const [isLoading, setIsLoading] = useState(false);

  const { data: userInfo } = useStripeCustomerInfo();

  const {
    values,
    setFieldValue,
    setErrors: setFormikErrors,
  } = useFormikContext<FormValues>();

  const genericPurchaseMutation = useMakePurchase();

  const isButtonDisabled =
    !values.captchaValue ||
    !values.TermsAndConditions ||
    !values.Description ||
    isLoading;

  const buyAction = values.FreeTrial === "useFreeTrial" ? "trial" : action;

  const sessionData = {
    gclid: getSessionData("gclid"),
    utm_campaign: getSessionData("utm_campaign"),
    utm_source: getSessionData("utm_source"),
    utm_medium: getSessionData("utm_medium"),
  };

  const {
    data: pendingPurchase,
    setPendingPurchaseID,
    error: purchaseError,
  } = usePollPurchaseStatus();

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
    localStorage.removeItem("ua-subscribe-state");
    setIsLoading(true);
  };

  const handleOnAfterPurchaseSuccess = () => {
    if (window.isGuest && !window.isLoggedIn) {
      const email = userInfo?.customerInfo?.email || values.email;
      location.href = `${
        location.pathname
      }/thank-you?email=${encodeURIComponent(email)}`;
    } else {
      location.pathname = "/pro/dashboard";
    }
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
    genericPurchaseMutation.mutate(
      {
        formData: values,
        product,
        quantity,
        action: buyAction,
      },
      {
        onSuccess: (data) => {
          //start polling
          setPendingPurchaseID(data);
          proSelectorStates.forEach((state) => localStorage.removeItem(state));
        },
        onError: (error) => {
          setIsLoading(false);

          if (error instanceof Error)
            if (
              error.message.includes("can only make one purchase at a time")
            ) {
              setError(
                <>
                  You already have a pending purchase. Please go to{" "}
                  <a href="/account/payment-methods">payment methods</a> to
                  retry.
                </>
              );
            } else if (error.message.includes("tax_id_invalid")) {
              setFormikErrors({
                VATNumber:
                  "That VAT number is invalid. Check the number and try again.",
              });
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
      setFieldValue("MarketingOptIn", false);
      setFieldValue("Description", false);
      setFieldValue("TermsAndConditions", false);
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
        values.MarketingOptIn ? "yes" : "no"
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
      disabled={isButtonDisabled}
      onClick={onPayClick}
      loading={isLoading}
    >
      Buy now
    </ActionButton>
  );
};

export default BuyButton;
