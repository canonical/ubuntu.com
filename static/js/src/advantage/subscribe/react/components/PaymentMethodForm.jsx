import React from "react";
import {
  Row,
  Col,
  Input,
  Form,
  Select,
  RadioInput,
} from "@canonical/react-components";
import useStripeCustomerInfo from "../APICalls/StripeCustomerInfo";
import { CardElement } from "@stripe/react-stripe-js";
import FormRow from "./FormRow";
import { countries } from "../../../countries-and-states";

function PaymentMethodForm() {
  return (
    <Form stacked className="u-sv3" id="payment-modal-form">
      <FormRow label="Payment card" error="Hé ho là">
        <div
          className="#card-element.StripeElement--invalid"
          style={{
            padding: "calc(0.4rem - 1px) .5rem",
            border: "1px solid rgba(0,0,0,.56)",
            borderRadius: 0,
            boxShadow: "inset 0 1px 1px rgb(0 0 0 / 12%)",
          }}
        >
          <CardElement
            options={{
              style: {
                base: {
                  iconColor: "#e95420",
                  color: "#111",
                  fontWeight: 300,
                  fontFamily:
                    '"Ubuntu", -apple-system, "Segoe UI", "Roboto", "Oxygen", "Cantarell", "Fira Sans", "Droid Sans", "Helvetica Neue", sans-serif',
                  fontSmoothing: "antialiased",
                  fontSize: "16px",
                  lineHeight: "24px",

                  "::placeholder": {
                    color: "#666",
                  },
                  ":-webkit-autofill": {
                    color: "#666",
                  },
                },
              },
            }}
          />
        </div>
      </FormRow>

      <Input
        type="email"
        id="email"
        label="Email my receipt to:"
        help="We'll also send setup instructions to this address."
        onChange={(e) => {
          console.log(e.target.validity);
          console.log(e.target.validationMessage);
        }}
        stacked
      />
      <Input type="text" id="name" label="Name" stacked />
      <FormRow label="I’m buying for:">
        <Form inline>
          <RadioInput name="buyingFor" value="myself" label="Myself" />
          <RadioInput
            name="buyingFor"
            value="organisation"
            label="An organisation"
          />
        </Form>
      </FormRow>
      <Input type="text" id="organisationName" label="Organisation:" stacked />
      <Input type="text" id="address" label="Address" stacked />
      <Input type="text" id="city" label="City" stacked />
      <Input type="text" id="postalCode" label="Postal code:" stacked />
      <Select
        id="exampleSelectInputError3"
        defaultValue=""
        options={countries}
        label="Country/Region:"
        stacked
      />
      <Input
        type="text"
        id="vatNumber"
        label="VAT number:"
        stacked
        help="e.g. GB 123 1234 12 123 or GB 123 4567 89 1234"
      />
    </Form>
  );
}

export default PaymentMethodForm;
