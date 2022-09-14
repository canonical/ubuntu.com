import React, { useRef, useState } from "react";
import * as Sentry from "@sentry/react";
import useStripeCustomerInfo from "./hooks/useStripeCustomerInfo";
import registerPaymentMethod from "./hooks/registerPaymentMethod";
import { Formik, FormikHelpers } from "formik";
import { UseMutationResult, useQueryClient } from "react-query";
import { getErrorMessage } from "../advantage/error-handler";
import usePurchase from "advantage/subscribe/react/hooks/usePurchase";
import { checkoutEvent } from "../advantage/ecom-events";
import {
  getUserInfoFromVariables,
  getInitialFormValues,
  FormValues,
  marketplace,
  marketplaceDisplayName,
} from "./utils/utils";

import { Col, List, Notification, Row } from "@canonical/react-components";
import Taxes from "./components/Taxes";
import SignIn from "./components/SignIn";
import UserInfoForm from "./components/UserInfoForm";
import ConfirmAndBuy from "./components/ConfirmAndBuy";
import ModalFooter from "./components/ModalParts/ModalFooter";
import BuyButton from "./components/BuyButton";

type Props = {
  accountId?: string;
  termsLabel: React.ReactNode;
  marketingLabel: React.ReactNode;
  product?: any;
  preview?: any;
  quantity?: number;
  closeModal: () => void;
  Summary: React.ComponentType;
  modalTitle?: string;
  isFreeTrialApplicable?: boolean;
  mutation: UseMutationResult<any, unknown, void, unknown>;
  marketplace: marketplace;
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
  isFreeTrialApplicable,
  mutation,
  marketplace,
}: Props) => {
  const [error, setError] = useState<React.ReactNode>(null);
  const { data: userInfo } = useStripeCustomerInfo();

  const sanitisedQuantity = quantity ?? 1;

  const purchaseMutation =
    mutation || usePurchase({ quantity: sanitisedQuantity, product });

  const [isCardValid, setCardValid] = useState(false);

  window.accountId = accountId ?? window.accountId;

  const titleRef = useRef<null | HTMLDivElement>(null);

  const queryClient = useQueryClient();

  const paymentMethodMutation = registerPaymentMethod();

  const initialValues = getInitialFormValues(userInfo, window.accountId);

  const isGuest = !userInfo?.customerInfo?.email;

  const GAFriendlyProduct = {
    id: product?.id,
    name: product?.name,
    price: product?.price?.value / 100,
    quantity: sanitisedQuantity,
  };
  const scrollToTop = () => {
    titleRef?.current?.scrollIntoView();
  };

  const onSubmit = (values: FormValues, actions: FormikHelpers<FormValues>) => {
    setError(null);
    checkoutEvent(GAFriendlyProduct, "2");
    paymentMethodMutation.mutate(
      { formData: values, marketplace: marketplace },
      {
        onSuccess: (data, variables) => {
          window.accountId = data.accountId;
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
              scrollToTop();
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
                scrollToTop();
                setError(knownErrorMessage);
              } else {
                Sentry.captureException(error);
                scrollToTop();
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
        <h1 ref={titleRef}>
          Your {marketplaceDisplayName[marketplace]} purchase
        </h1>
        {error ? (
          <Notification severity="negative" title="error">
            {error}
          </Notification>
        ) : null}
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
                {
                  title: "Region and taxes",
                  content: (
                    <Taxes product={product} quantity={sanitisedQuantity} />
                  ),
                },
                {
                  title: "Your purchase",
                  content: <Summary />,
                },
                ...(isGuest
                  ? [
                      {
                        title: "Sign in",
                        content: <SignIn />,
                      },
                    ]
                  : []),
                {
                  title: "Your information",
                  content: <UserInfoForm setCardValid={setCardValid} />,
                },
                {
                  title: "Confirm and buy",
                  content: (
                    <ConfirmAndBuy
                      termsLabel={termsLabel}
                      marketingLabel={marketingLabel}
                    />
                  ),
                },
              ]}
            />
            <ModalFooter closeModal={closeModal}>
              <BuyButton
                setError={setError}
                userInfo={userInfo}
                product={product}
                quantity={sanitisedQuantity}
                purchaseMutation={purchaseMutation}
              ></BuyButton>
            </ModalFooter>
          </>
        </Formik>
      </Row>
    </div>
  );
};

export default PurchaseModal;
