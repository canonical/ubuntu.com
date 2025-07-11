import ReCAPTCHA from "react-google-recaptcha";
import { Field, useFormikContext } from "formik";
import { CheckboxInput, Col, Input, Row } from "@canonical/react-components";
import {
  Action,
  CheckoutProducts,
  FormValues,
  Product,
} from "../../utils/types";

type Props = {
  products: CheckoutProducts[];
  action: Action;
};

const ConfirmAndBuy = ({ products, action }: Props) => {
  const { touched, errors, setFieldValue } = useFormikContext<FormValues>();
  const onCaptchaChange = (value: string | null) => {
    window.captcha = value;
    setFieldValue("captchaValue", window.captcha);
  };
  const product = products[0].product;

  const { termsLabel, descriptionLabel, marketingLabel } = getLabels(
    product,
    action,
  );

  const ReCAPTCHAComponent = ReCAPTCHA as unknown as React.ComponentType<any>;

  const validateCheckbox = (value: boolean) => {
    if (!value) {
      return "This field is required.";
    }
    return undefined;
  };

  return (
    <Row>
      <Col size={12}>
        <Field name="TermsAndConditions" validate={validateCheckbox}>
          {({ field, form }: any) => (
            <>
              <CheckboxInput
                {...field}
                id="TermsAndConditions"
                checked={field.value}
                onChange={() =>
                  form.setFieldValue("TermsAndConditions", !field.value)
                }
                label={termsLabel}
                validate={(value: string) => {
                  if (!value) {
                    return "This field is required.";
                  }
                  return;
                }}
                required
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
            </>
          )}
        </Field>
      </Col>
      <Col size={12}>
        <Field name="Description" validate={validateCheckbox}>
          {({ field, form }: any) => (
            <>
              <CheckboxInput
                {...field}
                id="Description"
                checked={field.value}
                onChange={() => form.setFieldValue("Description", !field.value)}
                label={descriptionLabel}
                required
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
            </>
          )}
        </Field>
      </Col>
      <Col size={12}>
        <Field name="MarketingOptIn">
          {({ field, form }: any) => (
            <CheckboxInput
              {...field}
              id="MarketingOptIn"
              checked={field.value}
              onChange={() =>
                form.setFieldValue("MarketingOptIn", !field.value)
              }
              label={marketingLabel}
            />
          )}
        </Field>
      </Col>
      <div className="p-strip is-shallow u-no-padding--top">
        <ReCAPTCHAComponent
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
            return "Captcha field is required.";
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
            href="https://canonical.com/legal/ubuntu-advantage-service-terms"
            target="_blank"
            rel="noopener norefferer"
          >
            Ubuntu Pro terms
          </a>
          , which apply to the{" "}
          <a href="https://canonical.com/legal/solution-support">
            Solution Support
          </a>{" "}
          service.
        </>
      ),
      descriptionLabel: (
        <>
          I agree to the{" "}
          <a
            href="https://canonical.com/legal/ubuntu-pro-description"
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
  if (product.marketplace == "canonical-cube") {
    return {
      termsLabel: (
        <>
          I agree to the{" "}
          <a
            href="https://canonical.com/legal/terms-and-policies/credentials-terms"
            target="_blank"
            rel="noopener noreferrer"
          >
            Credentials Terms of Service
          </a>
        </>
      ),
      descriptionLabel: (
        <>
          I have read the{" "}
          <a
            href="https://canonical.com/legal/data-privacy/credentials"
            target="_blank"
            rel="noopener norefferer"
          >
            Data Privacy Notice
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
          href="https://canonical.com/legal/ubuntu-advantage-service-terms"
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
          href="https://canonical.com/legal/ubuntu-pro-description"
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
