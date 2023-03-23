import React from "react";
import ReCAPTCHA from "react-google-recaptcha";
import { Field, useFormikContext } from "formik";
import { CheckboxInput, Col, Row } from "@canonical/react-components";
import { Action, FormValues, Product } from "../../utils/types";

type Props = {
  product: Product;
  action: Action;
};

const ConfirmAndBuy = ({ product, action }: Props) => {
  const { values, setFieldValue } = useFormikContext<FormValues>();

  const onCaptchaChange = (value: string | null) => {
    window.captcha = value;
    setFieldValue("captchaValue", window.captcha);
  };

  const { termsLabel, descriptionLabel, marketingLabel } = getLabels(
    product,
    action
  );

  return (
    <Row>
      <Col size={12}>
        <Field
          as={CheckboxInput}
          name="TermsAndConditions"
          label={termsLabel}
          checked={values.TermsAndConditions}
          defaultChecked={false}
        />
      </Col>
      <Col size={12}>
        <Field
          as={CheckboxInput}
          name="Description"
          label={descriptionLabel}
          checked={values.Description}
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
      <div className="p-strip is-shallow u-no-padding--top">
        <ReCAPTCHA
          sitekey={process.env.CAPTCHA_TESTING_API_KEY ?? ""}
          onChange={onCaptchaChange}
        />
      </div>
      <hr />
    </Row>
  );
};

const getLabels = (product: Product, action: Action) => {
  if (product.marketplace == "blender" || action == "offer") {
    return {
      termsLabel: (
        <>
          I agree to the{" "}
          <a
            href="/legal/ubuntu-advantage-service-terms"
            target="_blank"
            rel="noopener norefferer"
          >
            Ubuntu Pro terms
          </a>
          , which apply to the{" "}
          <a href="/legal/solution-support">Solution Support</a> service.
        </>
      ),
      descriptionLabel: (
        <>
          I agree to the{" "}
          <a
            href="/legal/ubuntu-pro-description"
            target="_blank"
            rel="noopener norefferer"
          >
            Ubuntu Pro description
          </a>
        </>
      ),
      marketingLabel: (
        <>
          I agree to receive information about Canonical&apos;s products and
          services
        </>
      ),
    };
  }

  return {
    termsLabel: (
      <>
        I agree to the{" "}
        <a
          href="/legal/ubuntu-advantage-service-terms"
          target="_blank"
          rel="noopener noreferrer"
        >
          Ubuntu Pro service terms
        </a>
      </>
    ),
    descriptionLabel: (
      <>
        I agree to the{" "}
        <a
          href="/legal/ubuntu-pro-description"
          target="_blank"
          rel="noopener noreferrer"
        >
          Ubuntu Pro description
        </a>
      </>
    ),
    marketingLabel: (
      <>
        I agree to receive information about Canonical&apos;s products and
        services
      </>
    ),
  };
};

export default ConfirmAndBuy;
