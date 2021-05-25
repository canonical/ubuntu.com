import React, { useEffect } from "react";
import {
  Row,
  Button,
  Input,
  Form,
  Select,
  RadioInput,
} from "@canonical/react-components";
import { useForm } from "react-hook-form";

import { CardElement } from "@stripe/react-stripe-js";
import FormRow from "./FormRow";
import {
  CAProvinces,
  countries,
  USStates,
  vatCountries,
} from "../../../countries-and-states";

function PaymentMethodForm() {
  const {
    register,
    unregister,
    handleSubmit,
    watch,
    formState: { errors, isDirty, isValid },
  } = useForm({ mode: "all" });

  const country = watch("country");
  const buyingFor = watch("buyingFor");

  const onSubmit = (data) => {
    console.log(data);
    console.log(errors);
  };

  useEffect(() => {
    if (country !== "CA") {
      console.log("unregistering");
      unregister("CAProvince");
    } else {
      console.log("registering");
      register("CAProvince");
    }
    if (country !== "US") {
      console.log("unregistering");
      unregister("USState");
    } else {
      console.log("registering");
      register("USState");
    }
  }, [country]);

  useEffect(() => {
    if (buyingFor === "myself") {
      console.log("unregistering");
      unregister("organisation");
    } else {
      console.log("registering");
      register("organisation");
    }
  }, [buyingFor]);

  return (
    <>
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
          stacked
          {...register("email", {
            required: "This field is required.",
            pattern: { value: /^\S+@\S+$/i, message: "must be a valid email." },
          })}
          error={errors.email?.message}
        />
        <Input
          type="text"
          id="name"
          label="Name"
          stacked
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
          {...register("address", { required: "This field is required." })}
          error={errors.address?.message}
        />
        <Input
          type="text"
          id="postalCode"
          label="Postal code:"
          stacked
          {...register("postalCode", { required: "This field is required." })}
          error={errors.postalCode?.message}
        />
        <Select
          id="country"
          defaultValue=""
          options={countries}
          label="Country/Region:"
          stacked
          {...register("country", { required: "This field is required." })}
          error={errors.country?.message}
        />
        <Input
          type="text"
          id="city"
          label="City"
          stacked
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
      <footer className="p-modal__footer">
        <Row className="u-no-padding">
          <Button
            className="js-cancel-modal col-small-2 col-medium-2 col-start-medium-3 col-start-large-7 col-3 u-no-margin"
            aria-controls="purchase-modal"
            style={{ textAlign: "center" }}
          >
            Cancel
          </Button>

          <Button
            disabled={!isDirty || !isValid}
            className="col-small-2 col-medium-2 col-3 p-button--positive u-no-margin"
            style={{ textAlign: "center" }}
            onClick={handleSubmit(onSubmit)}
          >
            Continue
          </Button>
        </Row>
      </footer>
    </>
  );
}

export default PaymentMethodForm;
