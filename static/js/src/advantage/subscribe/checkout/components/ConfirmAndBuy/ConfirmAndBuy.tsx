import ReCAPTCHA from "react-google-recaptcha";
import { Field, useFormikContext } from "formik";
import { CheckboxInput, Col, Input, Row } from "@canonical/react-components";
import { Action, FormValues, Product } from "../../utils/types";

type Props = {
  product: Product;
  action: Action;
};

const ConfirmAndBuy = ({ product, action }: Props) => {
  const {
    values,
    touched,
    errors,
    setFieldValue,
  } = useFormikContext<FormValues>();
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
          validate={(value: string) => {
            if (!value) {
              return "This field is required.";
            }
            return;
          }}
          required
          error={touched?.TermsAndConditions && errors?.TermsAndConditions}
        />
        {touched?.TermsAndConditions && errors?.TermsAndConditions && (
          <div className="p-form-validation is-error">
            <div
              className="p-form-validation__message"
              id="exampleInputErrorMessage"
              style={{ marginTop: "0.5rem" }}
            >
              <strong>Error:</strong> This field is required.
            </div>
          </div>
        )}
      </Col>
      <Col size={12}>
        <Field
          as={CheckboxInput}
          name="Description"
          label={descriptionLabel}
          checked={values.Description}
          defaultChecked={false}
          validate={(value: string) => {
            if (!value) {
              return "This field is required.";
            }
            return;
          }}
          required
          error={touched?.Description && errors?.Description}
        />
        {touched?.Description && errors?.Description && (
          <div className="p-form-validation is-error">
            <div
              className="p-form-validation__message"
              id="exampleInputErrorMessage"
              style={{ marginTop: "0.5rem" }}
            >
              <strong>Error:</strong> This field is required.
            </div>
          </div>
        )}
      </Col>
      <Col size={12}>
        <Field
          as={CheckboxInput}
          name="MarketingOptIn"
          id="MarketingOptIn"
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
      <Field
        as={Input}
        type="hidden"
        id="captchaValue"
        name="captchaValue"
        validate={() => {
          if (!window.captcha) {
            return "Captch field is required.";
          }
          return;
        }}
        required
        error={touched?.captchaValue && errors?.captchaValue}
      />
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
