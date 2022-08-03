import React, { useEffect, useState } from "react";
import * as Sentry from "@sentry/react";
import useStripeCustomerInfo from "./hooks/useStripeCustomerInfo";
import registerPaymentMethod from "./hooks/registerPaymentMethod";
import { Formik, FormikHelpers } from "formik";
import { useQueryClient } from "react-query";
import { getErrorMessage } from "../advantage/error-handler";
import { checkoutEvent } from "../advantage/ecom-events";
import {
  getUserInfoFromVariables,
  getInitialFormValues,
  FormValues,
  marketplace,
} from "./utils/utils";
import StepOne from "./components/ModalSteps/StepOne";
import StepTwo from "./components/ModalSteps/StepTwo";
import { BuyButtonProps } from "./utils/utils";
import { Col, List, Row } from "@canonical/react-components";
import Taxes from "./components/Taxes";

type Props = {
  accountId?: string;
  termsLabel: React.ReactNode;
  marketingLabel: React.ReactNode;
  product?: any;
  preview?: any;
  quantity?: number;
  closeModal: () => void;
  Summary: React.ComponentType;
  BuyButton: React.ComponentType<BuyButtonProps>;
  modalTitle?: string;
  isFreeTrialApplicable?: boolean;
  marketplace: marketplace;
};

const Component = () => {
  return (
    <div style={{ height: "300px", width: "300px", background: "hotpink" }} />
  );
};

const PurchaseModal = ({
  accountId,
  termsLabel,
  marketingLabel,
  product,
  preview,
  quantity,
  closeModal,
  Summary,
  BuyButton,
  modalTitle,
  isFreeTrialApplicable,
  marketplace,
}: Props) => {
  const [error, setError] = useState<React.ReactNode>(null);
  const { data: userInfo } = useStripeCustomerInfo();
  const [step, setStep] = useState(
    userInfo?.customerInfo?.defaultPaymentMethod ? 2 : 1
  );

  window.accountId = accountId ?? window.accountId;

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
    quantity: quantity ?? 1,
  };

  const onSubmit = (values: FormValues, actions: FormikHelpers<FormValues>) => {
    setError(null);
    checkoutEvent(GAFriendlyProduct, "2");
    paymentMethodMutation.mutate(
      { formData: values, marketplace: marketplace },
      {
        onSuccess: (data, variables) => {
          window.accountId = data.accountId;
          setStep(2);
          queryClient.setQueryData(
            "paymentModalUserInfo",
            getUserInfoFromVariables(data, variables.formData)
          );
          queryClient.invalidateQueries("preview");

          actions.setSubmitting(false);
        },
        onError: (error) => {
          if (error instanceof Error)
            if (error.message === "email_already_exists") {
              setError(
                <>
                  An Ubuntu One account with this email address exists. Please{" "}
                  <a href="/login">sign in</a> to your account first.
                </>
              );
            } else if (error.message === "tax_id_invalid") {
              actions.setErrors({
                VATNumber:
                  "That VAT number is invalid. Check the number and try again.",
              });
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
                    Sorry, there was an unknown error with your credit card.
                    Check the details and try again. Contact{" "}
                    <a href="https://ubuntu.com/contact-us">Canonical sales</a>{" "}
                    if the problem persists.
                  </>
                );
              }
            }

          actions.setSubmitting(false);
        },
      }
    );
  };

  return (
    <div className="checkout-container">
      <Row>
        <h1>Your {marketplace} purchase</h1>
        <Formik
          onSubmit={onSubmit}
          initialValues={initialValues}
          enableReinitialize={true}
        >
          <>
            <Col emptyLarge={7} size={6}>
              <p>* indicates a mandatory field</p>
            </Col>
            <List
              stepped
              detailed
              items={[
                { title: "Region and taxes", content: <Taxes /> },
                {
                  title: "Your purchase",
                  content: <Component />,
                },
                {
                  title: "Sign in",
                  content: <Component />,
                },
                {
                  title: "Your information",
                  content: <Component />,
                },
                { title: "Confirm and buy", content: <Component /> },
              ]}
            />
          </>
          {/* <>
          {step === 1 ? (
            <StepOne error={error} closeModal={closeModal} />
          ) : (
            <StepTwo
              termsLabel={termsLabel}
              marketingLabel={marketingLabel}
              setStep={setStep}
              error={error}
              setError={setError}
              Summary={Summary}
              closeModal={closeModal}
              product={product}
              preview={preview}
              BuyButton={BuyButton}
              modalTitle={modalTitle}
              isFreeTrialApplicable={isFreeTrialApplicable}
            />
          )}
        </> */}
        </Formik>
      </Row>
    </div>
  );
};

export default PurchaseModal;
