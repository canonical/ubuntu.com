import React, { useState, useEffect } from "react";
import {
  Row,
  Col,
  ActionButton,
  CheckboxInput,
} from "@canonical/react-components";
import * as Sentry from "@sentry/react";

import useStripeCustomerInfo from "../../APICalls/useStripeCustomerInfo";
import PaymentMethodSummary from "../PaymentMethodSummary";
import useProduct from "../../APICalls/useProduct";
import usePreview from "../../APICalls/usePreview";
import usePurchase from "../../APICalls/usePurchase";
import usePendingPurchase from "../../APICalls/usePendingPurchase";
import ModalHeader from "../ModalParts/ModalHeader";
import ModalBody from "../ModalParts/ModalBody";
import ModalFooter from "../ModalParts/ModalFooter";
import Summary from "../../components/Summary";
import { checkoutEvent, purchaseEvent } from "../../../../ecom-events";
import { getSessionData } from "../../../../../utils/getSessionData";

type StepOneProps = {
  setStep: React.Dispatch<React.SetStateAction<number>>;
  error: React.ReactNode | null;
  setError: React.Dispatch<React.SetStateAction<React.ReactNode>>;
};

function StepOne({ setStep, error, setError }: StepOneProps) {
  const [areTermsChecked, setTermsChecked] = useState(false);
  const {
    data: userInfo,
    isLoading: isUserInfoLoading,
  } = useStripeCustomerInfo();
  const { isLoading: isPreviewLoading } = usePreview();
  const { isLoading: isProductLoading, product, quantity } = useProduct();

  const purchaseMutation = usePurchase();

  const {
    data: pendingPurchase,
    setPendingPurchaseID,
    error: purchaseError,
    isLoading: isPendingPurchaseLoading,
  } = usePendingPurchase();

  const GAFriendlyProduct = {
    id: product?.id,
    name: product?.name,
    price: product?.price?.value / 100,
    quantity: quantity,
  };

  useEffect(() => {
    // the initial call was successful but it returned an error while polling the purchase status
    if (purchaseError instanceof Error) {
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
        setError(
          <>
            We were unable to process the payment. Check the details and try
            again. Contact{" "}
            <a href="https://ubuntu.com/contact-us">Canonical sales</a> if the
            problem persists.
          </>
        );
      }
      setTermsChecked(false);
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
      formData.append("munchkinId", "066-EOV-335");
      formData.append("formid", "3756");
      formData.append("formVid", "3756");
      formData.append("Email", userInfo?.customerInfo?.email);
      formData.append("Consent_to_Processing__c", "yes");
      formData.append("GCLID__c", getSessionData("gclid"));
      formData.append("utm_campaign", getSessionData("utm_campaign"));
      formData.append("utm_source", getSessionData("utm_source"));
      formData.append("utm_medium", getSessionData("utm_medium"));

      request.open(
        "POST",
        "https://app-sjg.marketo.com/index.php/leadCapture/save2"
      );
      request.send(formData);

      request.onreadystatechange = () => {
        if (request.readyState === 4) {
          //redirect
          if (window.isGuest) {
            const queryString = window.location.search;
            const testBackend = queryString.includes("test_backend=true")
              ? "&test_backend=true"
              : "";
            location.href = `/advantage/subscribe/thank-you?email=${encodeURIComponent(
              pendingPurchase?.invoice?.customerEmail
            )}${testBackend}`;
          } else {
            location.pathname = "/advantage";
          }
        }
      };
    }
  }, [pendingPurchase]);

  const onPayClick = () => {
    checkoutEvent(GAFriendlyProduct, "3");
    purchaseMutation.mutate(undefined, {
      onSuccess: (data) => {
        //start polling
        setPendingPurchaseID(data);
      },
      onError: (error) => {
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

  return (
    <>
      <ModalHeader title="Your details" />

      <ModalBody
        isLoading={isUserInfoLoading || isProductLoading || isPreviewLoading}
        error={error}
      >
        <>
          <Summary />
          <PaymentMethodSummary setStep={setStep} />
          <Row className="u-no-padding">
            <Col size={12}>
              <CheckboxInput
                name="TermsCheckbox"
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  setTermsChecked(e.target.checked);
                }}
                label={
                  <>
                    I agree to the{" "}
                    <a
                      href="/legal/ubuntu-advantage-service-terms"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Ubuntu Advantage service terms
                    </a>
                  </>
                }
              />
            </Col>
          </Row>
        </>
      </ModalBody>

      <ModalFooter>
        <ActionButton
          className="col-small-2 col-medium-2 col-3 u-no-margin"
          appearance="positive"
          style={{ textAlign: "center" }}
          disabled={!areTermsChecked}
          onClick={onPayClick}
          loading={purchaseMutation.isLoading || isPendingPurchaseLoading}
        >
          Pay
        </ActionButton>
      </ModalFooter>
    </>
  );
}

export default StepOne;
