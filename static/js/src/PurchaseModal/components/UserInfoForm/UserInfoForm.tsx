import React, { useEffect, useState } from "react";
import { Field, useFormikContext } from "formik";
import {
  Row,
  Col,
  Input,
  ActionButton,
  RadioInput,
} from "@canonical/react-components";
import { FormValues } from "advantage/subscribe/react/utils/utils";
import { getErrorMessage } from "advantage/error-handler";
import FormRow from "../FormRow";
import { CardElement } from "@stripe/react-stripe-js";
import PaymentMethodSummary from "./PaymentMethodSummary";
import useStripeCustomerInfo from "PurchaseModal/hooks/useStripeCustomerInfo";

type Error = {
  type: "validation_error";
  code: string;
  message: string;
};

type Props = {
  setCardValid: React.Dispatch<React.SetStateAction<boolean>>;
  isGuest: boolean;
};

const UserInfoForm = ({ setCardValid, isGuest }: Props) => {
  const {
    errors,
    touched,
    values,
    submitForm,
    isValid,
    isSubmitting,
  } = useFormikContext<FormValues>();

  const { data: userInfo } = useStripeCustomerInfo();
  const defaultPaymentMethod = userInfo?.customerInfo?.defaultPaymentMethod;
  const [isEditing, setIsEditing] = useState(isGuest || !defaultPaymentMethod);
  const [cardFieldHasFocus, setCardFieldFocus] = useState(false);
  const [cardFieldError, setCardFieldError] = useState<Error | null>(null);

  const toggleEditing = () => {
    if (isEditing) {
      submitForm();
    } else {
      setIsEditing(true);
    }
  };

  useEffect(() => {
    if (!isSubmitting && isValid && !!values.city) {
      setIsEditing(false);
    }
  }, [isSubmitting]);

  useEffect(() => {
    if (defaultPaymentMethod && !isEditing) {
      setCardValid(true);
    } else {
      setCardValid(false);
    }
  }, [isEditing]);

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
                    color: "#666",
                  },
                  ":-webkit-autofill": {
                    color: "#666",
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
        id="postalCode"
        name="postalCode"
        label="Postal code:"
        stacked
        validate={validateRequired}
        error={touched?.postalCode && errors?.postalCode}
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
    </>
  );

  return (
    <Row>
      {isEditing ? editMode : displayMode}
      {!isGuest ? (
        <div className="u-align--right">
          <ActionButton onClick={toggleEditing} loading={isSubmitting}>
            {isEditing ? "Save" : "Edit"}
          </ActionButton>
        </div>
      ) : null}
    </Row>
  );
};

export default UserInfoForm;
