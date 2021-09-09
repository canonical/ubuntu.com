import React, { useEffect, useRef, useState } from "react";
import * as Sentry from "@sentry/react";
import useStripeCustomerInfo from "./APICalls/useStripeCustomerInfo";
import registerPaymentMethod from "./APICalls/registerPaymentMethod";
import { Formik } from "formik";
import useProduct from "./APICalls/useProduct";
import { useQueryClient } from "react-query";
import { getErrorMessage } from "../../error-handler";
import { checkoutEvent } from "../../ecom-events";
import { getUserInfoFromVariables, getInitialFormValues } from "./utils/utils";
import StepOne from "./components/ModalSteps/StepOne";
import StepTwo from "./components/ModalSteps/StepTwo";

const PurchaseModal = () => {
  const [error, setError] = useState(null);
  const { data: userInfo } = useStripeCustomerInfo();
  const { product, quantity } = useProduct();
  const [step, setStep] = useState(
    userInfo?.customerInfo?.defaultPaymentMethod ? 2 : 1
  );
  const buttonRef = useRef(null);
  const queryClient = useQueryClient();

  const paymentMethodMutation = registerPaymentMethod();

  const initialValues = getInitialFormValues(userInfo, window.accountId);

  useEffect(() => {
    if (userInfo?.customerInfo?.defaultPaymentMethod) {
      setStep(2);
    }
  }, [userInfo]);

  const GAFriendlyProduct = {
    id: product?.id,
    name: product?.name,
    price: product?.price?.value / 100,
    quantity: quantity,
  };

  const onSubmit = (values, actions) => {
    setError(null);
    checkoutEvent(GAFriendlyProduct, 2);
    paymentMethodMutation.mutate(values, {
      onSuccess: (data, variables) => {
        window.accountId = data.accountId;
        setStep(2);
        queryClient.setQueryData(
          "userInfo",
          getUserInfoFromVariables(data, variables)
        );
        queryClient.invalidateQueries("preview");

        actions.setSubmitting(false);
      },
      onError: (error) => {
        if (error.message === "email_already_exists") {
          setError(
            <>
              An Ubuntu One account with this email address exists. Please{" "}
              <a href="/login">sign in</a> to your account first.
            </>
          );
        } else {
          const errorMessage = getErrorMessage({
            message: "",
            code: error.message,
          });

          // Tries to match the error with a known error code and defaults to a generic error if it fails
          if (errorMessage) {
            setError(errorMessage);
          } else {
            Sentry.captureException(error);
            setError(
              <>
                Sorry, there was an unknown error with your credit card. Check
                the details and try again. Contact{" "}
                <a href="https://ubuntu.com/contact-us">Canonical sales</a> if
                the problem persists.
              </>
            );
          }
        }

        actions.setSubmitting(false);
      },
    });
  };

  const closeModal = () => {
    // I have no idea what's going on here, but without it the modal won't close for guest users. ¯\_(ツ)_/¯
    buttonRef.current.click();
    buttonRef.current.click();
  };

  return (
    <Formik
      initialValues={initialValues}
      enableReinitialize={true}
      onSubmit={onSubmit}
    >
      <>
        {step === 1 ? (
          <StepOne error={error} closeModal={closeModal} />
        ) : (
          <StepTwo
            setStep={setStep}
            error={error}
            setError={setError}
            closeModal={closeModal}
          />
        )}
        <button
          ref={buttonRef}
          aria-controls="purchase-modal"
          aria-hidden="true"
          style={{ position: "absolute", left: "-9999px", opacity: 0 }}
        >
          Cancel
        </button>
      </>
    </Formik>
  );
};

export default PurchaseModal;
