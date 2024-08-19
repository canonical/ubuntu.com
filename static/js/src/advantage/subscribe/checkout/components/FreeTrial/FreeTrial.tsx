import { add, format } from "date-fns";
import { Field, useFormikContext } from "formik";
import { Col, RadioInput, Row } from "@canonical/react-components";
import { currencyFormatter } from "advantage/react/utils";
import useCalculate from "../../hooks/useCalculate";
import usePreview from "../../hooks/usePreview";
import {
  Action,
  Coupon,
  CheckoutProducts,
  FormValues,
  TaxInfo,
} from "../../utils/types";

type Props = {
  products: CheckoutProducts[];
  action: Action;
  coupon?: Coupon;
};

const DATE_FORMAT = "dd MMMM yyyy";

const FreeTrial = ({ products, action, coupon }: Props) => {
  const { values } = useFormikContext<FormValues>();
  const { data: calculate } = useCalculate({
    products,
    country: values.country,
    VATNumber: values.VATNumber,
    isTaxSaved: values.isTaxSaved,
  });

  const { data: preview } = usePreview({
    products,
    action,
    coupon,
  });
  const taxData: TaxInfo | undefined = preview || calculate;

  return (
    <Row>
      <Col size={12}>
        <Field name="FreeTrial">
          {({ field }: any) => (
            <>
              <RadioInput
                id="useFreeTrial"
                {...field}
                type="radio"
                value="useFreeTrial"
                checked={field.value === "useFreeTrial"}
                onChange={() =>
                  field.onChange({
                    target: { name: field.name, value: "useFreeTrial" },
                  })
                }
                disabled={!!window.currentPaymentId}
                label="Use free trial month"
              />
              <RadioInput
                id="payNow"
                {...field}
                type="radio"
                value="payNow"
                checked={field.value === "payNow"}
                onChange={() =>
                  field.onChange({
                    target: { name: field.name, value: "payNow" },
                  })
                }
                disabled={!!window.currentPaymentId}
                label="Pay now"
              />
            </>
          )}
        </Field>

        {values?.FreeTrial === "useFreeTrial" ? (
          <>
            <p>
              <strong>Your free trial ends: </strong>
              {format(
                add(new Date(), {
                  months: 1,
                }),
                DATE_FORMAT,
              )}{" "}
              after which time you will be charged
              {taxData?.total
                ? ` ${currencyFormatter.format(Number(taxData?.total) / 100)}`
                : ""}
              .
            </p>
            <p>
              You can cancel your subscription before your free trial ends in
              your Ubuntu Pro Dashboard
            </p>
          </>
        ) : null}
      </Col>
    </Row>
  );
};

export default FreeTrial;
