import React, { useEffect, useState } from "react";
import { useQueryClient } from "react-query";
import { Field, useFormikContext } from "formik";
import {
  ActionButton,
  Col,
  Input,
  RadioInput,
  Row,
} from "@canonical/react-components";
import * as Sentry from "@sentry/react";
import { CardElement } from "@stripe/react-stripe-js";
import { checkoutEvent } from "advantage/ecom-events";
import { getErrorMessage } from "advantage/error-handler";
import registerPaymentMethod from "../../hooks/postCustomerInfo";
import useCustomerInfo from "../../hooks/useCustomerInfo";
import { getUserInfoFromVariables } from "../../utils/helpers";
import { FormValues } from "../../utils/types";
import FormRow from "../FormRow";
import PaymentMethodSummary from "./PaymentMethodSummary";

type Error = {
  type: "validation_error";
  code: string;
  message: string;
};

type Props = {
  setError: React.Dispatch<React.SetStateAction<React.ReactNode>>;
  setCardValid: React.Dispatch<React.SetStateAction<boolean>>;
};

const UserInfoForm = ({ setError, setCardValid }: Props) => {
  const {
    errors,
    touched,
    values,
    setErrors: setFormikErrors,
    setFieldValue,
    isSubmitting,
  } = useFormikContext<FormValues>();
  const queryClient = useQueryClient();
  const { data: userInfo } = useCustomerInfo();
  const defaultPaymentMethod = userInfo?.customerInfo?.defaultPaymentMethod;
  const paymentMethodMutation = registerPaymentMethod();
  const [isEditing, setIsEditing] = useState(
    !window.accountId || !defaultPaymentMethod
  );
  const [isButtonDisabled, setIsButtonDisabled] = useState(false);
  const [cardFieldHasFocus, setCardFieldFocus] = useState(false);
  const [cardFieldError, setCardFieldError] = useState<Error | null>(null);

  const toggleEditing = () => {
    if (isEditing) {
      onSaveClick();
    } else {
      setIsEditing(true);
    }
  };

  useEffect(() => {
    if (defaultPaymentMethod && !isEditing) {
      setCardValid(true);
    } else {
      setCardValid(false);
    }
  }, [isEditing]);

  const onSaveClick = () => {
    checkoutEvent(window.GAFriendlyProduct, "2");
    setIsButtonDisabled(true);

    paymentMethodMutation.mutate(
      { formData: values },
      {
        onSuccess: (data, variables) => {
          queryClient.setQueryData(
            "customerInfo",
            getUserInfoFromVariables(data, variables.formData)
          );
          queryClient.invalidateQueries("preview");
          setIsButtonDisabled(false);
          setIsEditing(false);
        },
        onError: (error) => {
          setFieldValue("Description", false);
          setFieldValue("TermsAndConditions", false);
          setIsButtonDisabled(false);
          document.querySelector("h1")?.scrollIntoView();

          if (error instanceof Error)
            if (error.message === "email_already_exists") {
              setError(
                <>
                  An Ubuntu Pro account with this email address exists. Please{" "}
                  <a href="/login">sign in</a> or <a href="/login">register</a>{" "}
                  with your Ubuntu One account.
                </>
              );
            } else if (error.message.includes("tax_id_invalid")) {
              setFormikErrors({
                VATNumber:
                  "That VAT number is invalid. Check the number and try again.",
              });
              setError(
                <>That VAT number is invalid. Check the number and try again.</>
              );
            } else if (error.message.includes("tax_id_cannot_be_validated")) {
              setFormikErrors({
                VATNumber:
                  "VAT number could not be validated at this time, please try again later or contact customer success if the problem persists.",
              });
              setError(
                <>
                  VAT number could not be validated at this time, please try
                  again later or contact
                  <a href="mailto:customersuccess@canonical.com">
                    customer success
                  </a>{" "}
                  if the problem persists.
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
                    Sorry, there was an unknown error with your credit card.
                    Check the details and try again. Contact{" "}
                    <a href="https://ubuntu.com/contact-us">Canonical sales</a>{" "}
                    if the problem persists.
                  </>
                );
              }
            }
        },
      }
    );
  };

  const validateRequired = (value: string) => {
    let errorMessage;
    if (!value) {
      errorMessage = "This field is required.";
    }
    return errorMessage;
  };

  const validateOrganisationName = (value: string) => {
    let errorMessage;
    if (!value && values.buyingFor === "organisation") {
      errorMessage = "This field is required.";
    }
    return errorMessage;
  };

  const displayMode = (
    <>
      <Col size={12}>
        <PaymentMethodSummary />
      </Col>
      {values.buyingFor === "organisation" ? (
        <Col size={12}>
          <h3>{values.organisationName}</h3>
        </Col>
      ) : null}
      <Col size={4}>
        <p>Your name:</p>
      </Col>
      <Col size={8}>
        <p>
          <strong>{values.name}</strong>
        </p>
      </Col>
      <Col size={4}>
        <p>Billing address:</p>
      </Col>
      <Col size={8}>
        <p>
          <strong>{values.address}</strong>
        </p>
      </Col>
      <Col size={4}>
        <p>City:</p>
      </Col>
      <Col size={8}>
        <p>
          <strong>{values.city}</strong>
        </p>
      </Col>
      <Col size={4}>
        <p>Postal code:</p>
      </Col>
      <Col size={8}>
        <p>
          <strong>{values.postalCode}</strong>
        </p>
      </Col>
    </>
  );

  const editMode = (
    <>
      <FormRow
        label="Payment card:"
        error={getErrorMessage(cardFieldError ?? {})}
      >
        <div
          id="card-element"
          style={{
            backgroundColor: "#F5F5F6",
            borderBottom: "1px solid",
            padding: "calc(.4rem - 1px)",
            paddingLeft: "0.5rem",
            paddingRight: "0.5rem"
          }}
          className={`${cardFieldHasFocus ? "StripeElement--focus" : ""} ${
            cardFieldError ? "StripeElement--invalid" : ""
          }`}
        >
          <CardElement
            options={{
              style: {
                base: {
                  iconColor: "#e95420",
                  color: "#111",
                  fontWeight: 300,
                  fontFamily:
                    '"Ubuntu", -apple-system, "Segoe UI", "Roboto", "Oxygen", "Cantarell", "Fira Sans", "Droid Sans", "Helvetica Neue", sans-serif',
                  fontSmoothing: "antialiased",
                  fontSize: "16px",
                  lineHeight: "24px",

                  "::placeholder": {
                    color: "#000",
                  },
                  ":-webkit-autofill": {
                    color: "#000",
                  },
                },
              },
            }}
            onFocus={() => {
              setCardFieldFocus(true);
            }}
            onBlur={() => {
              setCardFieldFocus(false);
            }}
            onChange={(e) => {
              if (e.complete && !e.error) {
                setCardValid(true);
                setCardFieldError(null);
              } else {
                setCardValid(false);
                if (e.error) {
                  setCardFieldError(e.error);
                }
              }
            }}
          />
        </div>
      </FormRow>
      <Field
        as={Input}
        type="text"
        id="name"
        name="name"
        label="Name:"
        stacked
        validate={validateRequired}
        error={touched?.name && errors?.name}
      />
      <FormRow label="I’m buying for:">
        <div className="u-sv3 p-form p-form--inline" role="group">
          <Field
            as={RadioInput}
            name="buyingFor"
            value="myself"
            label="Myself"
            defaultChecked={values.buyingFor === "myself"}
          />
          <Field
            as={RadioInput}
            name="buyingFor"
            value="organisation"
            label="An organisation"
            defaultChecked={values.buyingFor === "organisation"}
          />
        </div>
      </FormRow>
      <Field
        as={Input}
        type="text"
        id="organisationName"
        name="organisationName"
        disabled={values.buyingFor === "myself"}
        label="Organisation:"
        stacked
        validate={validateOrganisationName}
        error={touched?.organisationName && errors?.organisationName}
      />
      <Field
        as={Input}
        type="text"
        id="address"
        name="address"
        label="Address:"
        stacked
        validate={validateRequired}
        error={touched?.address && errors?.address}
      />
      <Field
        as={Input}
        type="text"
        id="city"
        name="city"
        label="City:"
        stacked
        validate={validateRequired}
        error={touched?.city && errors?.city}
      />
      <Field
        as={Input}
        type="text"
        id="postalCode"
        name="postalCode"
        label="Postal code:"
        stacked
        validate={validateRequired}
        error={touched?.postalCode && errors?.postalCode}
      />
    </>
  );

  return (
    <Row>
      {isEditing ? editMode : displayMode}
      {window.accountId ? (
        <div className="u-align--right">
          {isEditing ? (
            <ActionButton
              onClick={() => {
                if (touched?.buyingFor) {
                  setFieldValue(
                    "buyingFor",
                    userInfo?.accountInfo?.name ? "organisation" : "myself"
                  );
                }
                if (touched?.organisationName) {
                  setFieldValue(
                    "organisationName",
                    userInfo?.accountInfo?.name
                  );
                }
                if (touched?.name) {
                  setFieldValue("name", userInfo?.customerInfo?.name);
                }
                if (touched?.address) {
                  setFieldValue(
                    "address",
                    userInfo?.customerInfo?.address?.line1
                  );
                }
                if (touched?.city) {
                  setFieldValue("city", userInfo?.customerInfo?.address?.city);
                }
                if (touched?.postalCode) {
                  setFieldValue(
                    "postalCode",
                    userInfo?.customerInfo?.address?.postal_code
                  );
                }
                setIsEditing(false);
              }}
            >
              Cancel
            </ActionButton>
          ) : null}
          <ActionButton
            onClick={toggleEditing}
            loading={isSubmitting}
            disabled={isButtonDisabled}
          >
            {isEditing ? "Save" : "Edit"}
          </ActionButton>
        </div>
      ) : null}
    </Row>
  );
};

export default UserInfoForm;
