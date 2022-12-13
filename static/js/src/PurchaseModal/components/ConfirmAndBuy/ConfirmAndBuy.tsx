import React from "react";
import { Field, useFormikContext } from "formik";
import { Row, Col, CheckboxInput } from "@canonical/react-components";
import ReCAPTCHA from "react-google-recaptcha";
import { FormValues } from "PurchaseModal/utils/utils";

type Props = {
  termsLabel: React.ReactNode;
  descriptionLabel: React.ReactNode;
  marketingLabel: React.ReactNode;
};

const ConfirmAndBuy = ({
  termsLabel,
  descriptionLabel,
  marketingLabel,
}: Props) => {
  const { setFieldValue } = useFormikContext<FormValues>();

  const onCaptchaChange = (value: string | null) => {
    setFieldValue("captchaValue", value);
  };

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
          name="Description"
          label={descriptionLabel}
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
      <ReCAPTCHA
        sitekey={process.env.CAPTCHA_TESTING_API_KEY ?? ""}
        onChange={onCaptchaChange}
      />
    </Row>
  );
};

export default ConfirmAndBuy;
