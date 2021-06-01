import { CardElement, useElements, useStripe } from "@stripe/react-stripe-js";
import { useMutation } from "react-query";
import {
  ensurePurchaseAccount,
  postCustomerInfoToStripeAccount,
} from "../../../contracts-api";

const registerPaymentMethod = () => {
  const stripe = useStripe();
  const elements = useElements();

  const mutation = useMutation(async (formData) => {
    const {
      name,
      organisation,
      email,
      address,
      city,
      country,
      postalCode,
      usState,
      CAProvince,
      vatNumber,
    } = formData;

    const card = elements.getElement(CardElement);

    const addressObject = {
      city: city,
      country: country,
      line1: address,
      postal_code: postalCode,
      state: country === "US" ? usState : CAProvince,
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

    const accountRes = await ensurePurchaseAccount({
      email: email,
      accountName: organisation || name,
      paymentMethodID: paymentMethod.id,
      country,
    });

    console.log({ accountRes });
    if (accountRes.code) {
      throw new Error(accountRes.code);
    }

    const customerInfoRes = await postCustomerInfoToStripeAccount({
      paymentMethodID: paymentMethod.id,
      accountID: accountRes.accountID,
      address: addressObject,
      name: name,
      taxID: vatNumber,
    });

    console.log({ customerInfoRes });
    if (customerInfoRes.errors) {
      throw new Error(customerInfoRes.errors);
    }

    return {
      accountId: accountRes.accountID,
      paymentMethod: paymentMethod.card,
    };
  });

  return mutation;
};

export default registerPaymentMethod;
