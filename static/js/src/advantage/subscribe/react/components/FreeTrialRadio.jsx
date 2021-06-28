import { RadioInput } from "@canonical/react-components";
import { Field } from "formik";
import React from "react";
import FormRow from "./FormRow";

const FreeTrialRadio = () => {
  return (
    <FormRow label="Free Trial:">
      <div className="u-sv3 p-form p-form--inline" role="group">
        <Field
          as={RadioInput}
          name="freeTrial"
          value="useFreeTrial"
          label="Use free trial month"
          defaultChecked={true}
        />
        <Field
          as={RadioInput}
          name="freeTrial"
          value="payNow"
          label="Pay now"
        />
      </div>
    </FormRow>
  );
};

export default FreeTrialRadio;
