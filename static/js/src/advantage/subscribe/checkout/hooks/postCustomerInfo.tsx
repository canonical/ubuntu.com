import { useMutation } from "react-query";
import { CardElement, useElements, useStripe } from "@stripe/react-stripe-js";
import {
  ensurePurchaseAccount,
  postCustomerInfoToStripeAccount,
} from "advantage/api/contracts";
import { FormValues } from "../utils/types";

type Props = {
  formData: FormValues;
};

const postCustomerInfo = () => {
  const stripe = useStripe();
  const elements = useElements();

  const mutation = useMutation(async ({ formData }: Props) => {
    const {
      name,
      buyingFor,
      organisationName,
      email,
      address,
      city,
      country,
      postalCode,
      usState,
      caProvince,
      VATNumber,
      captchaValue,
      marketplace,
    } = formData;

    const card = elements?.getElement(CardElement);

    if (!stripe || !card) {
      throw new Error("Stripe failed to initialise");
    }

    const addressObject = {
      city: city,
      country: country,
      line1: address,
      postal_code: postalCode,
      state: country === "US" ? usState : caProvince,
    };

    const { error, paymentMethod } = await stripe.createPaymentMethod({
      type: "card",
      card: card,
      billing_details: {
        name: name,
        email: email,
        address: addressObject,
      },
    });

    if (error) {
      throw new Error(error.code);
    }

    let accountRes = {
      accountID: window.accountId,
      code: null,
      message: "",
    };

    if (!window.accountId) {
      accountRes = await ensurePurchaseAccount({
        email: email,
        accountName: buyingFor === "myself" ? name : organisationName,
        captchaValue,
        marketplace,
      });

      if (accountRes.code) {
        if (accountRes.code === "unauthorized") {
          throw new Error("email_already_exists");
        } else {
          throw new Error(
            JSON.parse(accountRes.message)?.decline_code || accountRes.code
          );
        }
      } else {
        window.accountId = accountRes.accountID;
      }
    }

    const customerInfoRes = await postCustomerInfoToStripeAccount({
      paymentMethodID: paymentMethod?.id,
      accountID: accountRes.accountID,
      address: addressObject,
      name: name,
      taxID: {
        type: country === "ZA" ? "za_vat" : "eu_vat",
        value: VATNumber,
      },
    });

    if (customerInfoRes.errors) {
      const errors = JSON.parse(customerInfoRes.errors);

      throw new Error(errors.decline_code ?? errors.code);
    }

    return {
      paymentMethod: paymentMethod?.card,
      paymentMethodId: paymentMethod?.id,
    };
  });

  return mutation;
};

export default postCustomerInfo;
