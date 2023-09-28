import React, { useEffect, useState } from "react";
import { useQueryClient } from "react-query";
import { useFormikContext } from "formik";
import { getSessionData } from "utils/getSessionData";
import { ActionButton } from "@canonical/react-components";
import * as Sentry from "@sentry/react";
import { vatCountries } from "advantage/countries-and-states";
import { purchaseEvent } from "advantage/ecom-events";
import { getErrorMessage } from "advantage/error-handler";
import postCustomerInfo from "../../hooks/postCustomerInfo";
import postPurchase from "../../hooks/postPurchase";
import postPurchaseAccount from "../../hooks/postPurchaseAccount";
import useCustomerInfo from "../../hooks/useCustomerInfo";
import usePollPurchaseStatus from "../../hooks/usePollPurchaseStatus";
import { Action, FormValues, Product } from "../../utils/types";

type Props = {
  setError: React.Dispatch<React.SetStateAction<React.ReactNode>>;
  quantity: number;
  product: Product;
  action: Action;
};

const BuyButton = ({ setError, quantity, product, action }: Props) => {
  const [isLoading, setIsLoading] = useState(false);

  const {
    values,
    setFieldValue,
    setFieldTouched,
    setFieldError,
    validateForm,
    errors,
  } = useFormikContext<FormValues>();
  const { data: userInfo } = useCustomerInfo();
  const postPurchaseAccountMutation = postPurchaseAccount();
  const postCustomerInfoMutation = postCustomerInfo();
  const postPurchaseMutation = postPurchase();
  const buyAction = values.FreeTrial === "useFreeTrial" ? "trial" : action;
  const queryClient = useQueryClient();

  const sessionData = {
    gclid: getSessionData("gclid"),
    utm_campaign: getSessionData("utm_campaign"),
    utm_source: getSessionData("utm_source"),
    utm_medium: getSessionData("utm_medium"),
  };

  const {
    setPendingPurchaseID,
    data: pendingPurchase,
    error: purchaseError,
  } = usePollPurchaseStatus();

  useEffect(() => {
    if (!vatCountries.includes(values.country ?? "")) {
      setFieldValue("VATNumber", "");
    }
    if (values.country !== "US") {
      setFieldValue("usState", "");
    }
    if (values.country !== "CA") {
      setFieldValue("caProvince", "");
    }
  }, [values.country]);

  const onPayClick = async () => {
    validateForm().then((errors) => {
      const possibleErrors = Object.keys(errors);

      possibleErrors.forEach((error) => {
        setFieldTouched(error, true);
      });

      if (!(possibleErrors.length === 0)) {
        setError(<>Please make sure all fields are filled in correctly.</>);
        document.querySelector("h1")?.scrollIntoView();
        return;
      }
    });

    if (!(Object.keys(errors).length === 0)) {
      return;
    }

    // empty the product selector state persisted in the local storage
    // after the user chooses to make a purchase
    // to prevent page refreshes from causing accidental double purchasing
    localStorage.removeItem("ua-subscribe-state");
    setIsLoading(true);

    // Ensure the account exists
    if (!window.accountId) {
      await postPurchaseAccountMutation.mutateAsync(
        {
          formData: values,
        },
        {
          onSuccess: (accountData) => {
            window.accountId = accountData.accountId;
          },
          onError: (error) => {
            handleError(error);
          },
        }
      );
    }

    // Update customer information
    if (!values.defaultPaymentMethod) {
      await postCustomerInfoMutation.mutateAsync(
        { formData: values },
        {
          onError: (error) => {
            handleError(error);
          },
        }
      );
    }

    // Attempt or re-attempt the purchase
    await postPurchaseMutation.mutateAsync(
      {
        product,
        quantity,
        action: buyAction,
      },
      {
        onSuccess: (purchaseId: string) => {
          //start polling
          if (window.currentPaymentId) {
            queryClient.invalidateQueries("pendingPurchase");
          } else {
            setPendingPurchaseID(purchaseId);
            window.currentPaymentId = purchaseId;
          }
        },
        onError: (error) => {
          handleError(error);
        },
      }
    );
  };

  const handleError = (error: Error) => {
    setIsLoading(false);
    setFieldValue("Description", false);
    setFieldValue("TermsAndConditions", false);
    document.querySelector("h1")?.scrollIntoView();

    if (error.message.includes("can only make one purchase at a time")) {
      setError(
        <>
          You already have a pending purchase. Please go to{" "}
          <a href="/account/payment-methods">payment methods</a> to retry.
        </>
      );
    } else if (
      error.message.includes("purchase while subscription is in trial")
    ) {
      setError(
        <>
          You cannot make a purchase during the trial period. To make a new
          purchase, cancel your current trial subscription.
        </>
      );
    } else if (error.message.includes("tax_id_invalid")) {
      setFieldError(
        "VATNumber",
        "That VAT number is invalid. Check the number and try again."
      );
      setError(
        <>That VAT number is invalid. Check the number and try again.</>
      );
    } else if (error.message.includes("tax_id_cannot_be_validated")) {
      setFieldError(
        "VATNumber",
        "VAT number could not be validated at this time, please try again later or contact customer success if the problem persists."
      );
      setError(
        <>
          VAT number could not be validated at this time, please try again later
          or contact
          <a href="mailto:customersuccess@canonical.com">customer success</a> if
          the problem persists.
        </>
      );
    } else if (
      error.message.includes(
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
      const knownErrorMessage = getErrorMessage({
        message: "",
        code: error.message,
      });

      // Tries to match the error with a known error code and defaults to a generic error if it fails
      if (knownErrorMessage) {
        setError(knownErrorMessage);
      } else {
        Sentry.captureException(error);
        setError(
          <>
            Sorry, there was an unknown error with your credit card. Check the
            details and try again. Contact{" "}
            <a href="https://ubuntu.com/contact-us">Canonical sales</a> if the
            problem persists.
          </>
        );
      }
    }
  };

  useEffect(() => {
    // the initial call was successful but it returned an error while polling the purchase status
    if (purchaseError) {
      if (window.accountId) {
        queryClient.invalidateQueries("customerInfo");
      }
      setIsLoading(false);
      setFieldValue("Description", false);
      setFieldValue("TermsAndConditions", false);
      document.querySelector("h1")?.scrollIntoView();

      handleError(Error(purchaseError.message));
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

      if (localStorage.getItem("gaEventTriggered") === "true") {
        localStorage.removeItem("gaEventTriggered");
      }

      purchaseEvent(purchaseInfo, window.GAFriendlyProduct);

      // The state of the product selector is stored in the local storage
      // if a purchase is successful we empty it so the customer will see
      // the default values pre-selected instead of what they just bought.
      localStorage.removeItem("ua-subscribe-state");

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

      proSelectorStates.forEach((state) => localStorage.removeItem(state));

      const address = userInfo
        ? `${userInfo?.customerInfo?.address?.line1} ${userInfo?.customerInfo?.address?.line2} ${userInfo?.customerInfo?.address?.city} ${userInfo?.customerInfo?.address?.postal_code} ${userInfo?.customerInfo?.address?.state} ${userInfo?.customerInfo?.address?.country}`
        : `${values?.address} ${values?.postalCode} ${values?.city} ${values?.usState} ${values?.caProvince} ${values?.country}`;

      const getName = () => {
        const name = userInfo?.customerInfo?.name || values?.name;
        if (name && name.split(" ").length === 2) {
          formData.append("firstName", name.split(" ")[0] ?? "");
          formData.append("lastName", name.split(" ")[1] ?? "");
        } else {
          formData.append("firstName", "");
          formData.append("lastName", name ?? "");
        }
      };

      const request = new XMLHttpRequest();
      const formData = new FormData();
      formData.append("formid", "3756");
      getName();
      formData.append(
        "email",
        (userInfo?.customerInfo?.email || values.email) ?? ""
      );
      formData.append(
        "company",
        (userInfo?.accountInfo?.name || values?.organisationName) ?? ""
      );
      formData.append("street", address ?? "");
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
          localStorage.removeItem("shop-checkout-data");
          if (product.marketplace == "canonical-cube") {
            location.href = `/credentials/shop/order-thank-you?productName=${encodeURIComponent(
              product.name
            )}&quantity=${quantity}`;
          } else if (!window.loginSession) {
            const email = userInfo?.customerInfo?.email || values.email || "";
            let urlBase = "/pro/subscribe";
            if (product.marketplace == "blender") {
              urlBase = "/pro/subscribe/blender";
            }
            location.href = `${urlBase}/thank-you?email=${encodeURIComponent(
              email
            )}`;
          } else {
            location.href = "/pro/dashboard";
          }
        }
      };
    }
  }, [pendingPurchase]);

  return (
    <ActionButton
      className="u-float-right u-fixed-width"
      appearance="positive"
      aria-label="Buy"
      style={{ marginTop: "calc(.5rem - 1.5px)" }}
      onClick={onPayClick}
      loading={isLoading}
    >
      Buy now
    </ActionButton>
  );
};

export default BuyButton;
