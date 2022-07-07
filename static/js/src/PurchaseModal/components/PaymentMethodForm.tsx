import React, { useState, useEffect, useMemo } from "react";
import PropTypes from "prop-types";
import ReCAPTCHA from "react-google-recaptcha";

import {
  Row,
  Col,
  Input,
  Select,
  RadioInput,
} from "@canonical/react-components";
import { CardElement } from "@stripe/react-stripe-js";
import { debounce } from "lodash";

import usePostCustomerInfoForPurchasePreview from "../hooks/usePostCustomerInfoForPurchasePreview";
import useStripeCustomerInfo from "../hooks/useStripeCustomerInfo";
import FormRow from "./FormRow";
import {
  caProvinces,
  countries,
  USStates,
  vatCountries,
} from "../../advantage/countries-and-states";
import { getErrorMessage } from "../../advantage/error-handler";
import { Field, Form, useFormikContext } from "formik";
import { FormValues } from "../utils/utils";

type Error = {
  type: "validation_error";
  code: string;
  message: string;
};

type Props = {
  setCardValid: React.Dispatch<React.SetStateAction<boolean>>;
};

function PaymentMethodForm({ setCardValid }: Props) {
  const [cardFieldHasFocus, setCardFieldFocus] = useState(false);
  const [cardFieldError, setCardFieldError] = useState<Error | null>(null);
  const mutation = usePostCustomerInfoForPurchasePreview();
  const { data: userInfo } = useStripeCustomerInfo();

  const isEmailPrepopulated = !!userInfo?.customerInfo?.email;

  const {
    dirty,
    errors,
    touched,
    values,
    setTouched,
    setErrors,
    setSubmitting,
    setFieldValue,
  } = useFormikContext<FormValues>();

  const validateEmail = (value: string) => {
    let errorMessage;
    if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(value)) {
      errorMessage = "Must be a valid email.";
    }
    if (!value) {
      errorMessage = "This field is required.";
    }
    return errorMessage;
  };

  const validateRequired = (value: string) => {
    let errorMessage;
    if (!value) {
      errorMessage = "This field is required.";
    }
    return errorMessage;
  };

  const validateUSState = (value: string) => {
    let errorMessage;
    if (!value && values.country === "US") {
      errorMessage = "This field is required.";
    }
    return errorMessage;
  };

  const validatecaProvince = (value: string) => {
    let errorMessage;
    if (!value && values.country === "CA") {
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

  useEffect(() => {
    setCardValid(false);
  }, []);

  useEffect(() => {
    if (values.buyingFor === "myself") {
      setTouched({ organisationName: false });
    }
  }, [values.buyingFor]);

  const updateCustomerInfoForPurchasePreview = (formValues: FormValues) => {
    setSubmitting(true);
    mutation.mutate(formValues, {
      onError: (error) => {
        if (error instanceof Error && error.message === "tax_id_invalid") {
          setErrors({
            VATNumber:
              "That VAT number is invalid. Check the number and try again.",
          });
        }
      },
      onSettled: () => {
        setSubmitting(false);
      },
    });
  };
  const updateCustomerInfoForPurchasePreviewDebounced = useMemo(
    () => debounce(updateCustomerInfoForPurchasePreview, 250),
    []
  );

  useEffect(() => {
    if (!vatCountries.includes(values.country ?? "")) {
      setTouched({ organisationName: false });
      values.VATNumber = "";
    }
  }, [values.country]);

  useEffect(() => {
    if (window.accountId && dirty) {
      updateCustomerInfoForPurchasePreviewDebounced(values);
    }
  }, [values.country, values.VATNumber]);

  const onCaptchaChange = (value: string | null) => {
    setFieldValue("captchaValue", value);
  };

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
        stacked
        help="We'll also send setup instructions to this address."
        label="Email my receipt to:"
        type="email"
        id="email"
        name="email"
        disabled={isEmailPrepopulated}
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
        label="City:"
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
          id="caProvinces"
          name="caProvince"
          options={caProvinces}
          label="Province:"
          stacked
          validate={validatecaProvince}
          error={touched?.caProvince && errors?.caProvince}
        />
      )}
      {vatCountries.includes(values.country ?? "") && (
        <Field
          as={Input}
          type="text"
          id="VATNumber"
          name="VATNumber"
          label="VAT number:"
          stacked
          help="e.g. GB 123 1234 12 123 or GB 123 4567 89 1234"
          error={touched?.VATNumber && errors?.VATNumber}
        />
      )}

      <Row className="u-no-padding u-sv1">
        <Col size={8} emptyLarge={5}>
          <ReCAPTCHA
            sitekey={process.env.CAPTCHA_TESTING_API_KEY ?? ""}
            onChange={onCaptchaChange}
          />
        </Col>
      </Row>

      <Row className="u-no-padding u-sv1">
        <Col size={8} emptyLarge={5}>
          <p>You will have a chance to review on the next step...</p>
        </Col>
      </Row>
    </Form>
  );
}

PaymentMethodForm.propTypes = {
  setCardValid: PropTypes.func.isRequired,
};

export default PaymentMethodForm;
