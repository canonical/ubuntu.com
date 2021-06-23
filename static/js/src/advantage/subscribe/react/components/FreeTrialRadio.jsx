import { RadioInput } from "@canonical/react-components";
import { Field, useFormikContext } from "formik";
import React from "react";
import FormRow from "./FormRow";

const FreeTrialRadio = () => {
  const { values } = useFormikContext();
  return (
    <FormRow label="Free Trial:">
      <div className="u-sv3 p-form p-form--inline" role="group">
        <Field
          as={RadioInput}
          name="freeTrial"
          value="useFreeTrial"
          label="Use free trial month"
          defaultChecked={values.freeTrial === "useFreeTrial"}
        />
        <Field
          as={RadioInput}
          name="freeTrial"
          value="payNow"
          label="Pay now"
          defaultChecked={values.freeTrial === "payNow"}
        />
      </div>
    </FormRow>
  );
};

export default FreeTrialRadio;
