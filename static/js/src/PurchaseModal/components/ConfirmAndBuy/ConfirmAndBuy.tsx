import React, { useEffect, useState } from "react";
import { Field, Form, useFormikContext } from "formik";
import {
  Row,
  Col,
  Select,
  Input,
  ActionButton,
  Link,
  Button,
  CheckboxInput,
} from "@canonical/react-components";
import { FormValues, getLabel } from "advantage/subscribe/react/utils/utils";

type Props = {
  termsLabel: React.ReactNode;
  marketingLabel: React.ReactNode;
};

const ConfirmAndBuy = ({ termsLabel, marketingLabel }: Props) => {
  return (
    <Row>
      <Col size={12}>
        <Field
          as={CheckboxInput}
          name="TermsAndConditions"
          label={termsLabel}
          defaultChecked={false}
        />
      </Col>
      <Col size={12}>
        <Field
          as={CheckboxInput}
          name="MarketingOptIn"
          label={marketingLabel}
          defaultChecked={false}
        />
      </Col>
    </Row>
  );
};

export default ConfirmAndBuy;
