import { CardElement, useElements, useStripe } from "@stripe/react-stripe-js";
import { useMutation } from "react-query";
import {
  ensurePurchaseAccount,
  postCustomerInfoToStripeAccount,
} from "../../advantage/api/contracts";
import { FormValues, marketplace } from "../utils/utils";

type Props = {
  formData: FormValues;
  marketplace: marketplace;
};

const registerPaymentMethod = () => {
  const stripe = useStripe();
  const elements = useElements();

  const mutation = useMutation(async ({ formData, marketplace }: Props) => {
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
    let accountRes = { accountID: window.accountId, code: null, message: "" };

    if (!accountRes.accountID) {
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
      }
    }

    const customerInfoRes = await postCustomerInfoToStripeAccount({
      paymentMethodID: paymentMethod?.id,
      accountID: accountRes.accountID,
      address: addressObject,
      name: name,
      taxID: {
        type: "eu_vat",
        value: VATNumber,
      },
    });

    if (customerInfoRes.errors) {
      const errors = JSON.parse(customerInfoRes.errors);
      //We ignore VAT errors but throw the others
      if (errors.code !== "tax_id_invalid") {
        throw new Error(errors.decline_code ?? errors.code);
      }
    }

    return {
      accountId: accountRes.accountID,
      paymentMethod: paymentMethod?.card,
    };
  });

  return mutation;
};

export default registerPaymentMethod;
