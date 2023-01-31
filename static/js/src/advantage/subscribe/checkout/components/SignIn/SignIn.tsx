import React from "react";
import { Field, useFormikContext } from "formik";
import { Button, Col, Input, Row } from "@canonical/react-components";
import { FormValues } from "../../utils/types";

const SignIn = () => {
  const { errors, touched } = useFormikContext<FormValues>();

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
