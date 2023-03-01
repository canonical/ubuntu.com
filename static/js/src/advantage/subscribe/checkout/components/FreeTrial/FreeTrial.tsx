import React from "react";
import { add, format } from "date-fns";
import { Field, useFormikContext } from "formik";
import { Col, RadioInput, Row } from "@canonical/react-components";
import { currencyFormatter } from "advantage/react/utils";
import { Action, FormValues, Product, TaxInfo } from "../../utils/types";
import usePreview from "../../hooks/usePreview";
import useCalculate from "../../hooks/useCalculate";

type Props = {
  product: Product;
  quantity: number;
  action: Action;
};

const DATE_FORMAT = "dd MMMM yyyy";

const FreeTrial = ({ quantity, product, action }: Props) => {
  const { values } = useFormikContext<FormValues>();
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
  });
  const priceData: TaxInfo | undefined = preview || calculate;
  const taxData = priceData;

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
        />
        <Field
          as={RadioInput}
          type="radio"
          id="payNow"
          name="FreeTrial"
          label="Pay now"
          value="payNow"
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
