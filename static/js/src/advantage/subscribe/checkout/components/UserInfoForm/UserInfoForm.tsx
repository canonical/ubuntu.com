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
  isSubmitted: boolean;
};

const UserInfoForm = ({ setError, isSubmitted }: Props) => {
  const {
    errors,
    touched,
    values,
    initialValues,
    setErrors: setFormikErrors,
    setFieldValue,
    isSubmitting,
  } = useFormikContext<FormValues>();
  const queryClient = useQueryClient();
  const paymentMethodMutation = registerPaymentMethod();
  const [isEditing, setIsEditing] = useState(
    !window.accountId || !initialValues.defaultPaymentMethod
  );
  const [isButtonDisabled, setIsButtonDisabled] = useState(false);
  const [cardFieldHasFocus, setCardFieldFocus] = useState(false);
  const [cardFieldError, setCardFieldError] = useState<Error | null>(null);

  const toggleEditing = () => {
    if (isEditing) {
      onSaveClick();
    } else {
      setIsEditing(true);
      setFieldValue("isInfoSaved", false);
    }
  };

  useEffect(() => {
    setFieldValue("isCardValid", !isEditing);
  }, [isEditing]);

  useEffect(() => {
    if (!initialValues.email || !window.accountId) {
      setFieldValue("isInfoSaved", true);
    }
  }, []);

  const onSaveClick = () => {
    checkoutEvent(window.GAFriendlyProduct, "2");
    setIsButtonDisabled(true);
    setFieldValue("isInfoSaved", true);

    paymentMethodMutation.mutate(
      { formData: values },
      {
        onSuccess: () => {
          queryClient.invalidateQueries("customerInfo");
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
    } else if (
      values.buyingFor === "organisation" &&
      values.organisationName === values.name
    ) {
      errorMessage = 'Please select "I\'m buying for: Myself" option above.';
    }
    return errorMessage;
  };

  const displayMode = (
    <>
      <PaymentMethodSummary />
      {values.buyingFor === "organisation" ? (
        <>
          <Row>
            <Col size={4}>
              <p>Organisation:</p>
            </Col>
            <Col size={8}>
              <p>
                <strong data-testid="organisation-name">
                  {values.organisationName}
                </strong>
              </p>
            </Col>
          </Row>
          <hr />
        </>
      ) : null}
      <Row>
        <Col size={4}>
          <p>Your name:</p>
        </Col>
        <Col size={8}>
          <p>
            <strong data-testid="customer-name">{values.name}</strong>
          </p>
        </Col>
      </Row>
      <hr />
      <Row>
        <Col size={4}>
          <p>Billing address:</p>
        </Col>
        <Col size={8}>
          <p>
            <strong data-testid="customer-address">{values.address}</strong>
          </p>
        </Col>
      </Row>
      <hr />
      <Row>
        <Col size={4}>
          <p>City:</p>
        </Col>
        <Col size={8}>
          <p>
            <strong data-testid="customer-city">{values.city}</strong>
          </p>
        </Col>
      </Row>
      <hr />
      <Row>
        <Col size={4}>
          <p>Postal code:</p>
        </Col>
        <Col size={8}>
          <p>
            <strong data-testid="customer-postal-code">
              {values.postalCode}
            </strong>
          </p>
        </Col>
      </Row>
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
            borderBottom: "1.5px solid #111",
            padding: "calc(.4rem - 1px)",
            paddingLeft: "0.5rem",
            paddingRight: "0.5rem",
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
                setFieldValue("isCardValid", true);
                setCardFieldError(null);
              } else {
                setFieldValue("isCardValid", false);
                if (e.error) {
                  setCardFieldError(e.error);
                }
              }
            }}
          />
        </div>
      </FormRow>
      {!values.isCardValid && isSubmitted && (
        <div className="p-form-validation is-error">
          <div
            className="p-form-validation__message"
            id="exampleInputErrorMessage"
          >
            <strong>Error:</strong> This field is required.
          </div>
        </div>
      )}
      <Field
        data-testid="field-customer-name"
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
            disabled={window.accountId && initialValues.organisationName}
          />
          <Field
            as={RadioInput}
            name="buyingFor"
            value="organisation"
            label="An organisation"
            defaultChecked={values.buyingFor === "organisation"}
            disabled={window.accountId && initialValues.organisationName}
          />
        </div>
      </FormRow>
      {initialValues.buyingFor === "myself" &&
      window.accountId &&
      initialValues.organisationName ? null : (
        <Field
          data-testid="field-org-name"
          as={Input}
          type="text"
          id="organisationName"
          name="organisationName"
          disabled={
            values.buyingFor === "myself" ||
            (window.accountId && initialValues.organisationName)
          }
          label="Organisation:"
          stacked
          validate={validateOrganisationName}
          error={
            values.buyingFor === "organisation" &&
            touched?.organisationName &&
            errors?.organisationName
          }
        />
      )}
      <Field
        data-testid="field-address"
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
        data-testid="field-city"
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
        data-testid="field-post-code"
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
      {window.accountId && initialValues.defaultPaymentMethod ? (
        <>
          <hr />
          <div
            className="u-align--right"
            style={{ marginTop: "calc(.5rem - 1.5px)" }}
          >
            {isEditing ? (
              <ActionButton
                onClick={() => {
                  setFieldValue("buyingFor", initialValues.buyingFor);
                  setFieldValue(
                    "organisationName",
                    initialValues.organisationName
                  );
                  setFieldValue("name", initialValues.name);
                  setFieldValue("address", initialValues.address);
                  setFieldValue("city", initialValues.city);
                  setFieldValue("postalCode", initialValues.postalCode);
                  setIsEditing(false);
                  setFieldValue("isInfoSaved", true);
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
        </>
      ) : null}
    </Row>
  );
};

export default UserInfoForm;
