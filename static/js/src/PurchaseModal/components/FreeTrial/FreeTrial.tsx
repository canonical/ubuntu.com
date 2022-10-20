import React from "react";
import { RadioInput, Row, Col } from "@canonical/react-components";
import { add, format } from "date-fns";
import { Field, useFormikContext } from "formik";
import { FormValues } from "PurchaseModal/utils/utils";
import useGetTaxAmount from "PurchaseModal/hooks/useGetTaxAmount";
import { currencyFormatter } from "advantage/react/utils";

const DATE_FORMAT = "dd MMMM yyyy";

const FreeTrial = () => {
  const { values } = useFormikContext<FormValues>();
  const { data: preview } = useGetTaxAmount();

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
              {preview?.total
                ? ` ${currencyFormatter.format(Number(preview?.total) / 100)}`
                : ""}
              .
            </p>
            <p>
              You can cancel your subscription before your free trial ends in
              your UA Dashboard
            </p>
          </>
        ) : null}
      </Col>
    </Row>
  );
};

export default FreeTrial;
