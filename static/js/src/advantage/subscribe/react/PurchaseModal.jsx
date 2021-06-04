import React, { useEffect, useState } from "react";
import {
  Row,
  Col,
  ActionButton,
  CheckboxInput,
  Notification,
} from "@canonical/react-components";
import useStripeCustomerInfo from "./APICalls/StripeCustomerInfo";
import registerPaymentMethod from "./APICalls/RegisterPaymentMethod";
import PaymentMethodSummary from "./components/PaymentMethodSummary";
import PaymentMethodForm from "./components/PaymentMethodForm";
import Summary from "./components/Summary";
import { Formik } from "formik";
import useProduct from "./APICalls/Product";
import usePreview from "./APICalls/Preview";
import makePurchase from "./APICalls/Purchase";
import usePendingPurchase from "./APICalls/PendingPurchase";
import { useQueryClient } from "react-query";
import { getErrorMessage } from "../../error-handler";

const PurchaseModal = () => {
  const [error, setError] = useState(null);
  const [paymentError, setPaymentError] = useState(null);
  const [areTermsChecked, setTermsChecked] = useState(false);
  const [isCardValid, setCardValid] = useState(false);
  const {
    data: userInfo,
    isLoading: isUserInfoLoading,
  } = useStripeCustomerInfo();

  const [step, setStep] = useState(window.accountId ? 2 : 1);

  useEffect(() => {
    if (userInfo?.customerInfo?.defaultPaymentMethod) {
      setStep(2);
    }
  }, [userInfo]);

  const queryClient = useQueryClient();

  const { isLoading: isProductLoading } = useProduct();
  // const { data: preview, isLoading: isPreviewLoading } = usePreview();
  const {
    data: pendingPurchase,
    setPendingPurchaseID,
    error: purchaseError,
    isLoading: isPendingPurchaseLoading,
  } = usePendingPurchase();

  const paymentMethodMutation = registerPaymentMethod();
  const purchaseMutation = makePurchase();

  useEffect(() => {
    // the initial call was successful but it returned an error while polling the purchase status
    if (purchaseError) {
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
      setStep(1);
    }
  }, [purchaseError]);

  useEffect(() => {
    if (pendingPurchase?.status === "done") {
      // Remove the product selection from the local storage
      localStorage.removeItem("ua-subscribe-state");

      //redirect
      if (window.isGuest) {
        location.href = `/advantage/subscribe/thank-you?email=${encodeURIComponent(
          pendingPurchase?.invoice?.customerEmail
        )}`;
      } else {
        location.pathname = "/advantage";
      }
    }
  }, [pendingPurchase]);

  const onPayClick = () => {
    purchaseMutation.mutate("", {
      onSuccess: (data) => {
        //start polling
        setPendingPurchaseID(data);
      },
      onError: (error) => {
        // An error happened
        if (error.message.includes("can only make one purchase at a time")) {
          setError(
            <>
              You already have a pending purchase. Please go to{" "}
              <a href="/advantage/payment-methods">payment methods</a> to retry.
            </>
          );
        } else {
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
    <div>
      <Formik
        initialValues={{
          email: userInfo?.customerInfo?.email ?? "",
          name: userInfo?.customerInfo?.name ?? "",
          buyingFor: "organisation",
          organisationName: userInfo?.accountInfo?.name ?? "",
          address: userInfo?.customerInfo?.address?.line1 ?? "",
          postalCode: userInfo?.customerInfo?.address?.postal_code ?? "",
          country: userInfo?.customerInfo?.address?.country ?? "",
          city: userInfo?.customerInfo?.address?.city ?? "",
          usState: userInfo?.customerInfo?.address?.state ?? "",
          CAProvince: userInfo?.customerInfo?.address?.state ?? "",
          VATNumber: userInfo?.customerInfo?.taxID?.value ?? "",
        }}
        enableReinitialize={true}
        onSubmit={(values, actions) => {
          setError(null);
          paymentMethodMutation.mutate(values, {
            onSuccess: (data, variables) => {
              window.accountId = data.accountId;
              setStep(2);
              queryClient.setQueryData("userInfo", {
                customerInfo: {
                  email: variables.email,
                  name: variables.name,
                  address: {
                    line1: variables.address,
                    postal_code: variables.postalCode,
                    country: variables.country,
                    city: variables.city,
                    state:
                      variables.country === "US"
                        ? variables.usState
                        : variables.CAProvince,
                  },
                  defaultPaymentMethod: {
                    brand: data.paymentMethod.brand,
                    last4: data.paymentMethod.last4,
                    expMonth: data.paymentMethod.exp_month,
                    expYear: data.paymentMethod.exp_year,
                  },
                },
                accountInfo: {
                  name: variables.organisationName,
                },
              });

              actions.setSubmitting(false);
            },
            onError: (error, variables) => {
              if (error.message === "email_already_exists") {
                //Email already exists
                setError(
                  <>
                    An Ubuntu One account with this email address exists. Please{" "}
                    <a href="/login">sign in</a> to your account first.
                  </>
                );
              } else {
                // Tries to match the error with a known error code and defaults to a generic error if it fails
                setError(
                  getErrorMessage({ message: "", code: error.message }) ?? (
                    <>
                      Sorry, there was an unknown error with your credit card.
                      Check the details and try again. Contact{" "}
                      <a href="https://ubuntu.com/contact-us">
                        Canonical sales
                      </a>{" "}
                      if the problem persists.
                    </>
                  )
                );
              }

              actions.setSubmitting(false);
            },
          });
        }}
      >
        {({ isValid, dirty, submitForm, isSubmitting }) => (
          <>
            <header className="p-modal__header">
              <h2
                className="p-modal__title u-no-margin--bottom"
                id="modal-title"
              >
                Complete purchase {status}
              </h2>
            </header>
            <div id="modal-description" className="p-modal__body">
              {isUserInfoLoading || isProductLoading ? (
                <h1>LOADING.....</h1>
              ) : (
                <>
                  <Summary />
                  {error && (
                    <Notification type="negative" status="Error:">
                      {error}
                    </Notification>
                  )}
                  {step === 1 ? (
                    <PaymentMethodForm
                      setCardValid={setCardValid}
                      paymentError={paymentError}
                    />
                  ) : (
                    <PaymentMethodSummary setStep={setStep} />
                  )}
                </>
              )}
              {step === 1 ? null : (
                <Row className="u-no-padding">
                  <Col size="12">
                    <CheckboxInput
                      name="TermsCheckbox"
                      onChange={(e) => {
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
              )}
            </div>
            <footer className="p-modal__footer">
              <Row className="u-no-padding">
                <ActionButton
                  className="js-cancel-modal col-small-2 col-medium-2 col-start-medium-3 col-start-large-7 col-3 u-no-margin"
                  appearance="neutral"
                  aria-controls="purchase-modal"
                  style={{ textAlign: "center" }}
                >
                  Cancel
                </ActionButton>

                {step === 1 ? (
                  <ActionButton
                    disabled={(!userInfo && !dirty) || !isValid || !isCardValid}
                    appearance="positive"
                    className="col-small-2 col-medium-2 col-3 u-no-margin"
                    style={{ textAlign: "center" }}
                    onClick={submitForm}
                    loading={isSubmitting}
                  >
                    Continue
                  </ActionButton>
                ) : (
                  <ActionButton
                    className="col-small-2 col-medium-2 col-3 u-no-margin"
                    appearance="positive"
                    style={{ textAlign: "center" }}
                    disabled={!areTermsChecked}
                    onClick={onPayClick}
                    loading={
                      purchaseMutation.isLoading || isPendingPurchaseLoading
                    }
                  >
                    Pay
                  </ActionButton>
                )}
              </Row>
            </footer>
          </>
        )}
      </Formik>
    </div>
  );
};

export default PurchaseModal;
