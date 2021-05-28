import React, { useState, useEffect } from "react";
import { Input, Select, RadioInput } from "@canonical/react-components";

import { CardElement } from "@stripe/react-stripe-js";
import FormRow from "./FormRow";
import {
  CAProvinces,
  countries,
  USStates,
  vatCountries,
} from "../../../countries-and-states";
import { getErrorMessage } from "../../../error-handler";
import { Field, Form, useFormikContext } from "formik";

function PaymentMethodForm({ setCardValid }) {
  const [cardFieldHasFocus, setCardFieldFocus] = useState(false);
  const [cardFieldError, setCardFieldError] = useState(null);

  const { errors, touched, values, setTouched } = useFormikContext();

  const validateEmail = (value) => {
    let errorMessage;
    if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(value)) {
      errorMessage = "Must be a valid email.";
    }
    if (!value) {
      errorMessage = "This field is required.";
    }
    return errorMessage;
  };

  const validateRequired = (value) => {
    let errorMessage;
    if (!value) {
      errorMessage = "This field is required.";
    }
    return errorMessage;
  };

  const validateUSState = (value) => {
    let errorMessage;
    if (!value && values.country === "US") {
      errorMessage = "This field is required.";
    }
    return errorMessage;
  };

  const validateCAProvince = (value) => {
    let errorMessage;
    if (!value && values.country === "CA") {
      errorMessage = "This field is required.";
    }
    return errorMessage;
  };

  const validateOrganisationName = (value) => {
    let errorMessage;
    if (!value && values.buyingFor === "organisation") {
      errorMessage = "This field is required.";
    }
    return errorMessage;
  };

  useEffect(() => {
    if (values.buyingFor === "myself") {
      setTouched({ organisationName: false });
    }
  }, [values.buyingFor]);

  return (
    <Form className="u-sv3 p-form p-form--stacked" id="payment-modal-form">
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
                  border: "4px solid black",

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
              } else {
                setCardValid(false);
                setCardFieldError(e.error);
              }
            }}
          />
        </div>
      </FormRow>

      <Field
        as={Input}
        stacked
        help="We'll also send setup instructions to this address."
        label="Email my receipt to:"
        type="email"
        id="email"
        name="email"
        validate={validateEmail}
        error={touched?.email && errors?.email}
      />
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
          />
          <Field
            as={RadioInput}
            name="buyingFor"
            value="organisation"
            label="An organisation"
            defaultChecked
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
        label="Address"
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
        as={Select}
        id="country"
        name="country"
        options={countries}
        label="Country/Region:"
        stacked
        validate={validateRequired}
        error={touched?.country && errors?.country}
      />
      <Field
        as={Input}
        type="text"
        id="city"
        name="city"
        label="City"
        stacked
        validate={validateRequired}
        error={touched?.city && errors?.city}
      />
      {values.country === "US" && (
        <Field
          as={Select}
          id="usStates"
          name="usState"
          options={USStates}
          label="State:"
          stacked
          validate={validateUSState}
          error={touched?.usState && errors?.usState}
        />
      )}
      {values.country === "CA" && (
        <Field
          as={Select}
          id="CAProvinces"
          name="CAProvince"
          options={CAProvinces}
          label="Province:"
          stacked
          validate={validateCAProvince}
          error={touched?.CAProvince && errors?.CAProvince}
        />
      )}
      {vatCountries.includes(values.country) && (
        <Field
          as={Input}
          type="text"
          id="vatNumber"
          name="vatNumber"
          label="VAT number:"
          stacked
          help="e.g. GB 123 1234 12 123 or GB 123 4567 89 1234"
          error={touched?.VATNumber && errors?.VATNumber}
        />
      )}
    </Form>
  );
}

export default PaymentMethodForm;
