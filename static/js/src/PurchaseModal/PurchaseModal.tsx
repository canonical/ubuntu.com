import React, { useEffect, useRef, useState } from "react";
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
  marketplaceDisplayName,
  Product,
  Action,
} from "./utils/utils";

import { Col, List, Notification, Row } from "@canonical/react-components";
import Taxes from "./components/Taxes";
import SignIn from "./components/SignIn";
import UserInfoForm from "./components/UserInfoForm";
import ConfirmAndBuy from "./components/ConfirmAndBuy";
import ModalFooter from "./components/ModalParts/ModalFooter";
import BuyButton from "./components/BuyButton";
import FreeTrial from "./components/FreeTrial";

type Props = {
  accountId?: string;
  termsLabel: React.ReactNode;
  descriptionLabel: React.ReactNode;
  marketingLabel: React.ReactNode;
  product: Product | null;
  quantity: number;
  closeModal: () => void;
  Summary: React.ComponentType;
  action?: Action;
};

const PurchaseModal = ({
  accountId,
  termsLabel,
  descriptionLabel,
  marketingLabel,
  product,
  quantity,
  closeModal,
  Summary,
  action = "purchase",
}: Props) => {
  if (!product) {
    return null;
  }

  // Block the scroll on the body when the modal is open
  useEffect(() => {
    document.body.style.height = "100vh";
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.height = "auto";
      document.body.style.overflow = "auto";
    };
  }, []);

  const [error, setError] = useState<React.ReactNode>(null);
  const { data: userInfo } = useStripeCustomerInfo();

  const [isCardValid, setCardValid] = useState(false);

  window.accountId = accountId ?? window.accountId;

  const titleRef = useRef<null | HTMLDivElement>(null);

  const queryClient = useQueryClient();

  const paymentMethodMutation = registerPaymentMethod();

  const initialValues = getInitialFormValues(
    userInfo,
    window.accountId,
    product.canBeTrialled
  );

  const isGuest = !userInfo?.customerInfo?.email;

  const GAFriendlyProduct = {
    id: product?.id,
    name: product?.name,
    price: product?.price?.value / 100,
    quantity: quantity,
  };
  const scrollToTop = () => {
    titleRef?.current?.scrollIntoView();
  };

  const onSubmit = (values: FormValues, actions: FormikHelpers<FormValues>) => {
    setError(null);
    checkoutEvent(GAFriendlyProduct, "2");
    paymentMethodMutation.mutate(
      { formData: values, marketplace: product.marketplace },
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
          Your {marketplaceDisplayName[product.marketplace]} purchase
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
                    <Taxes
                      product={product}
                      quantity={quantity}
                      setError={setError}
                    />
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
                  content: (
                    <UserInfoForm
                      setCardValid={setCardValid}
                      isGuest={isGuest}
                    />
                  ),
                },
                ...(product.canBeTrialled
                  ? [
                      {
                        title: "Free trial",
                        content: <FreeTrial />,
                      },
                    ]
                  : []),
                {
                  title: "Confirm and buy",
                  content: (
                    <ConfirmAndBuy
                      termsLabel={termsLabel}
                      descriptionLabel={descriptionLabel}
                      marketingLabel={marketingLabel}
                    />
                  ),
                },
              ]}
            />
            <ModalFooter closeModal={closeModal}>
              <BuyButton
                setError={setError}
                product={product}
                quantity={quantity}
                action={action}
                isCardValid={isCardValid}
              ></BuyButton>
            </ModalFooter>
          </>
        </Formik>
      </Row>
    </div>
  );
};

export default PurchaseModal;
