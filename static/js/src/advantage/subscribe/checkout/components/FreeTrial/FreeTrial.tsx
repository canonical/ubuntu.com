import React from "react";
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
  const product = products[0].product;
  const quantity = products[0].quantity;
  const { data: calculate } = useCalculate({
    quantity: quantity,
    marketplace: product.marketplace,
    productListingId: product.longId,
    country: values.country,
    VATNumber: values.VATNumber,
    isTaxSaved: values.isTaxSaved,
  });

  const { data: preview } = usePreview({
    quantity,
    product,
    action,
    coupon,
  });
  const taxData: TaxInfo | undefined = preview || calculate;

  return (
    <Row>
      <Col size={12}>
        <Field
          as={RadioInput}
          type="radio"
          id="useFreeTrial"
          name="FreeTrial"
          label="Use free trial month"
          value="useFreeTrial"
          disabled={!!window.currentPaymentId}
        />
        <Field
          as={RadioInput}
          type="radio"
          id="payNow"
          name="FreeTrial"
          label="Pay now"
          value="payNow"
          disabled={!!window.currentPaymentId}
        />
        {values?.FreeTrial === "useFreeTrial" ? (
          <>
            <p>
              <strong>Your free trial ends: </strong>
              {format(
                add(new Date(), {
                  months: 1,
                }),
                DATE_FORMAT
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
