import React, { useEffect, useState, useMemo } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useFormikContext } from "formik";
import { getSessionData } from "utils/getSessionData";
import { ActionButton } from "@canonical/react-components";
import { vatCountries } from "advantage/countries-and-states";
import { purchaseEvent } from "advantage/ecom-events";
import { getNotificationMessage } from "../../utils/translateErrors";
import postCustomerInfo from "../../hooks/postCustomerInfo";
import postPurchase from "../../hooks/postPurchase";
import postPurchaseAccount from "../../hooks/postPurchaseAccount";
import useCustomerInfo from "../../hooks/useCustomerInfo";
import usePollPurchaseStatus from "../../hooks/usePollPurchaseStatus";
import {
  Action,
  Coupon,
  CheckoutProducts,
  FormValues,
} from "../../utils/types";
import {
  DISTRIBUTOR_SELECTOR_KEYS,
  PRO_SELECTOR_KEYS,
} from "advantage/distributor/utils/utils";
import { confirmNavigateListener } from "../../utils/helpers";
import type { DisplayError } from "../../utils/types";

type Props = {
  setError: React.Dispatch<React.SetStateAction<DisplayError | null>>;
  products: CheckoutProducts[];
  action: Action;
  coupon?: Coupon;
  errorType: string;
  isDisabled: boolean;
};

const BuyButton = ({
  setError,
  products,
  action,
  coupon,
  errorType,
  isDisabled,
}: Props) => {
  const [isLoading, setIsLoading] = useState(false);

  const isBuyButtonDisabled = useMemo(() => {
    return isLoading || errorType === "cue-banned" || isDisabled;
  }, [isLoading, errorType, isDisabled]);

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
  const poNumber = values.poNumber || null;

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
    if (errorType === "cue-banned") return;
    setIsLoading(true);
    confirmNavigateListener.set();
    validateForm().then((errors) => {
      const possibleErrors = Object.keys(errors);
      possibleErrors.forEach((error) => {
        setFieldTouched(error, true);
      });

      if (!(possibleErrors.length === 0)) {
        setError({
          description: (
            <>Please make sure all fields are filled in correctly.</>
          ),
        });
        document.querySelector("h1")?.scrollIntoView();
        setIsLoading(false);
        return;
      }
    });

    if (!(Object.keys(errors).length === 0)) {
      setIsLoading(false);
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
        },
      );
    }

    // Update customer information
    const hasZeroPriceValue = products.some(
      (item) => item.product.price.value === 0,
    );
    if (!values.defaultPaymentMethod && !hasZeroPriceValue) {
      await postCustomerInfoMutation.mutateAsync(
        { formData: values },
        {
          onError: (error) => {
            handleError(error);
          },
        },
      );
    }

    // Attempt or re-attempt the purchase
    await postPurchaseMutation.mutateAsync(
      {
        products,
        action: buyAction,
        coupon,
        poNumber,
      },
      {
        onSuccess: (purchaseId: string) => {
          //start polling
          if (window.currentPaymentId) {
            queryClient.invalidateQueries({ queryKey: ["pendingPurchase"] });
          } else {
            setPendingPurchaseID(purchaseId);
            window.currentPaymentId = purchaseId;
          }
        },
        onError: (error) => {
          handleError(error);
        },
      },
    );
  };

  const handleError = (error: Error) => {
    confirmNavigateListener.clear();
    setIsLoading(false);
    setFieldValue("Description", false);
    setFieldValue("TermsAndConditions", false);
    document.querySelector("h1")?.scrollIntoView();

    if (error.message.includes("can only make one purchase at a time")) {
      setError({
        description: (
          <>
            You already have a pending purchase. Please go to{" "}
            <a href="/account/payment-methods">payment methods</a> to retry.
          </>
        ),
      });
    } else if (
      error.message.includes("purchase while subscription is in trial")
    ) {
      setError({
        description: (
          <>
            You cannot make a purchase during the trial period. To make a new
            purchase, cancel your current trial subscription.
          </>
        ),
      });
    } else if (error.message.includes("tax_id_invalid")) {
      setFieldError(
        "VATNumber",
        "That VAT number is invalid. Check the number and try again.",
      );
      setError({
        description: (
          <>That VAT number is invalid. Check the number and try again.</>
        ),
      });
    } else if (error.message.includes("tax_id_cannot_be_validated")) {
      setFieldError(
        "VATNumber",
        "VAT number could not be validated at this time, please try again later or contact customer success if the problem persists.",
      );
      setError({
        description: (
          <>
            VAT number could not be validated at this time, please try again
            later or contact{" "}
            <a href="mailto:customersuccess@canonical.com">
              customer success
            </a>{" "}
            if the problem persists.
          </>
        ),
      });
    } else if (
      error.message.includes(
        "We are unable to authenticate your payment method",
      )
    ) {
      setError({
        description: (
          <>
            We were unable to verify your credit card. Check the details and try
            again. Contact{" "}
            <a href="https://ubuntu.com/contact-us">Canonical sales</a> if the
            problem persists.
          </>
        ),
      });
    } else if (
      error.message.includes(
        "missing one-off product listing for renewal product",
      )
    ) {
      setError({
        description: (
          <>
            The chosen product cannot be renewed as it has been deprecated.
            Contact <a href="https://ubuntu.com/contact-us">Canonical sales </a>
            to choose a substitute offering.
          </>
        ),
      });
    } else {
      const knownErrorMessage = getNotificationMessage(error);
      setError(knownErrorMessage);
    }
  };

  useEffect(() => {
    // the initial call was successful but it returned an error while polling the purchase status
    if (purchaseError) {
      if (window.accountId) {
        queryClient.invalidateQueries({ queryKey: ["customerInfo"] });
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

      const proSelectorKeysArray = Object.values(PRO_SELECTOR_KEYS);
      const distributorSelectorKeysArray = Object.values(
        DISTRIBUTOR_SELECTOR_KEYS,
      );

      proSelectorKeysArray.forEach((key) => {
        localStorage.removeItem(key);
      });

      distributorSelectorKeysArray.forEach((key) => {
        localStorage.removeItem(key);
      });

      const address = [
        values?.address,
        values?.postalCode,
        values?.city,
        values?.usState,
        values?.caProvince,
        values?.country,
      ]
        .filter(Boolean)
        .join(" ");

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
        (userInfo?.customerInfo?.email || values.email) ?? "",
      );
      formData.append(
        "company",
        (userInfo?.accountInfo?.name || values?.organisationName) ?? "",
      );
      if (address) {
        formData.append("street", address ?? "");
      }
      formData.append("Consent_to_Processing__c", "yes");
      formData.append("GCLID__c", sessionData?.gclid || "");
      formData.append("utm_campaign", sessionData?.utm_campaign || "");
      formData.append("utm_source", sessionData?.utm_source || "");
      formData.append("utm_medium", sessionData?.utm_medium || "");
      formData.append("store_name__c", "ua");
      formData.append(
        "canonicalUpdatesOptIn",
        values.MarketingOptIn ? "yes" : "no",
      );

      request.open("POST", "/marketo/submit");
      request.send(formData);

      request.onreadystatechange = () => {
        if (request.readyState === 4) {
          confirmNavigateListener.clear();
          localStorage.removeItem("shop-checkout-data");
          const product = products[0].product;
          const quantity = products[0].quantity;
          if (product.marketplace == "canonical-cube") {
            if (product.name === "cue-linux-essentials-free") {
              location.href = `/credentials/shop/order-thank-you?productName=${encodeURIComponent(
                "CUE.01 Linux",
              )}&quantity=${quantity}`;
            } else {
              location.href = `/credentials/shop/order-thank-you?productName=${encodeURIComponent(
                product.name,
              )}&quantity=${quantity}`;
            }
          } else if (!window.loginSession) {
            const email = userInfo?.customerInfo?.email || values.email || "";
            let urlBase = "/pro/subscribe";
            if (product.marketplace == "blender") {
              urlBase = "/pro/subscribe/blender";
            }
            location.href = `${urlBase}/thank-you?email=${encodeURIComponent(
              email,
            )}`;
          } else if (product.marketplace === "canonical-pro-channel") {
            const email = userInfo?.customerInfo?.email || values.email || "";
            const urlBase = "/pro/distributor";
            location.href = `${urlBase}/thank-you?email=${encodeURIComponent(
              email,
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
      disabled={isBuyButtonDisabled}
    >
      Buy now
    </ActionButton>
  );
};

export default BuyButton;
