import React, { useState, useEffect } from "react";
import {
  Row,
  Button,
  Input,
  Form,
  Select,
  RadioInput,
} from "@canonical/react-components";

import { CardElement } from "@stripe/react-stripe-js";
import FormRow from "./FormRow";
import {
  CAProvinces,
  countries,
  USStates,
  vatCountries,
} from "../../../countries-and-states";
import { getErrorMessage } from "../../../error-handler";
import useStripeCustomerInfo from "../APICalls/StripeCustomerInfo";

function PaymentMethodForm({ formContext, setCardValid, paymentError }) {
  const [cardFieldHasFocus, setCardFieldFocus] = useState(false);
  const [cardFieldError, setCardFieldError] = useState(null);

  const { data: userInfo } = useStripeCustomerInfo();

  const {
    register,
    unregister,
    watch,
    formState: { errors },
  } = formContext;

  const country = watch("country");
  const buyingFor = watch("buyingFor");

  useEffect(() => {
    if (country !== "CA") {
      unregister("CAProvince");
    } else {
      register("CAProvince");
    }
    if (country !== "US") {
      unregister("USState");
    } else {
      register("USState");
    }
  }, [country]);

  useEffect(() => {
    if (buyingFor === "myself") {
      console.log("unregistering");
      unregister("organisation", { keepValue: true });
    } else {
      console.log("registering");
      register("organisation");
    }
  }, [buyingFor]);

  return (
    <>
      <Form stacked className="u-sv3" id="payment-modal-form">
        <FormRow
          label="Payment card:"
          error={getErrorMessage(cardFieldError ?? {})}
        >
          <div
            id="card-element"
            className={`${cardFieldHasFocus ? "StripeElement--focus" : ""} ${
              cardFieldError ? "StripeElement--invalid" : ""
            }`}
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
                    border: "4px solid black",

                    "::placeholder": {
                      color: "#666",
                    },
                    ":-webkit-autofill": {
                      color: "#666",
                    },
                  },
                },
              }}
              onFocus={() => {
                setCardFieldFocus(true);
              }}
              onBlur={() => {
                setCardFieldFocus(false);
              }}
              onChange={(e) => {
                if (e.complete && !e.error) {
                  setCardValid(true);
                } else {
                  setCardValid(false);
                  setCardFieldError(e.error);
                }
              }}
            />
          </div>
        </FormRow>

        <Input
          type="email"
          id="email"
          label="Email my receipt to:"
          help="We'll also send setup instructions to this address."
          stacked
          defaultValue={userInfo?.customerInfo?.email}
          {...register("email", {
            required: "This field is required.",
            pattern: {
              value: /^\S+@\S+$/i,
              message: "must be a valid email.",
            },
          })}
          error={errors.email?.message}
        />
        <Input
          type="text"
          id="name"
          label="Name"
          stacked
          defaultValue={userInfo?.customerInfo?.name}
          {...register("name", { required: "This field is required." })}
          error={errors.name?.message}
        />
        <FormRow label="I’m buying for:">
          <Form inline>
            <RadioInput
              name="buyingFor"
              value="myself"
              label="Myself"
              {...register("buyingFor")}
            />
            <RadioInput
              name="buyingFor"
              value="organisation"
              label="An organisation"
              defaultChecked
              {...register("buyingFor")}
            />
          </Form>
        </FormRow>
        <Input
          type="text"
          id="organisationName"
          disabled={buyingFor === "myself"}
          label="Organisation:"
          stacked
          defaultValue={userInfo?.accountInfo?.name}
          {...register("organisation", {
            required: {
              value: buyingFor !== "myself",
              message: "This field is required.",
            },
          })}
          error={errors.organisation?.message}
        />
        <Input
          type="text"
          id="address"
          label="Address"
          stacked
          defaultValue={userInfo?.customerInfo?.address?.line1}
          {...register("address", { required: "This field is required." })}
          error={errors.address?.message}
        />
        <Input
          type="text"
          id="postalCode"
          label="Postal code:"
          stacked
          defaultValue={userInfo?.customerInfo?.address?.postal_code}
          {...register("postalCode", { required: "This field is required." })}
          error={errors.postalCode?.message}
        />
        <Select
          id="country"
          defaultValue=""
          options={countries}
          label="Country/Region:"
          stacked
          defaultValue={userInfo?.customerInfo?.address?.country}
          {...register("country", { required: "This field is required." })}
          error={errors.country?.message}
        />
        <Input
          type="text"
          id="city"
          label="City"
          stacked
          defaultValue={userInfo?.customerInfo?.address?.city}
          {...register("city", { required: "This field is required." })}
          error={errors.city?.message}
        />
        {country === "US" && (
          <Select
            id="usStates"
            defaultValue=""
            options={USStates}
            label="State:"
            stacked
            defaultValue={userInfo?.customerInfo?.address?.state}
            {...register("USState", {
              required: {
                value: country === "US",
                message: "This field is required.",
              },
            })}
            error={errors.USState?.message}
          />
        )}
        {country === "CA" && (
          <Select
            id="CAProvinces"
            defaultValue=""
            options={CAProvinces}
            label="Province:"
            stacked
            defaultValue={userInfo?.customerInfo?.address?.state}
            {...register("CAProvince", {
              required: {
                value: country === "CA",
                message: "This field is required.",
              },
            })}
            error={errors.CAProvince?.message}
          />
        )}
        {vatCountries.includes(country) && (
          <Input
            type="text"
            id="vatNumber"
            label="VAT number:"
            stacked
            help="e.g. GB 123 1234 12 123 or GB 123 4567 89 1234"
            {...register("VATNumber")}
          />
        )}
      </Form>
    </>
  );
}

export default PaymentMethodForm;
