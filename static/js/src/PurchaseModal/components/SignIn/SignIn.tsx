import React, { useEffect, useState } from "react";
import ReCAPTCHA from "react-google-recaptcha";
import { Field, Form, useFormikContext } from "formik";
import {
  Row,
  Col,
  Select,
  Input,
  ActionButton,
  Link,
  Button,
} from "@canonical/react-components";
import { FormValues, getLabel } from "advantage/subscribe/react/utils/utils";
import {
  caProvinces,
  countries,
  USStates,
  vatCountries,
} from "advantage/countries-and-states";

const SignIn = () => {
  const {
    errors,
    touched,
    values,
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

  useEffect(() => {
    if (!vatCountries.includes(values.country ?? "")) {
      setFieldValue("VATNumber", "");
    }
    if (values.country !== "US") {
      setFieldValue("usState", "");
    }
    if (values.country !== "CA") {
      setFieldValue("caProvince", "");
    }
  }, [values.country]);

  return (
    <Row>
      <Col size={12}>
        <p>
          Sign in to add new subscriptions or to renew existing subscriptions.
        </p>
        <Button appearance="positive" element="a" href="/login">
          Sign in with Ubuntu One
        </Button>
      </Col>
      <Col size={12}>
        <hr />
        <p>
          <strong>Don&apos;t have an Ubuntu One account? Start here</strong>
        </p>
        <Field
          as={Input}
          stacked
          wrapperClassName="email-field"
          help="Set up instructions and invoices will be sent to this address"
          label="Your email address:"
          type="email"
          id="email"
          name="email"
          validate={validateEmail}
          required
          error={touched?.email && errors?.email}
        />
      </Col>
    </Row>
  );
};

export default SignIn;
