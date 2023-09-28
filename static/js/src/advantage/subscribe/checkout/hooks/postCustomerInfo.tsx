import { useMutation } from "react-query";
import { CardElement, useElements, useStripe } from "@stripe/react-stripe-js";
import { postCustomerInfoToStripeAccount } from "advantage/api/contracts";
import { FormValues } from "../utils/types";

type Props = {
  formData: FormValues;
};

const postCustomerInfo = () => {
  const stripe = useStripe();
  const elements = useElements();

  const mutation = useMutation<any, Error, Props>(
    async ({ formData }: Props) => {
      const {
        name,
        email,
        address,
        city,
        country,
        postalCode,
        usState,
        caProvince,
        VATNumber,
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

      const customerInfoRes = await postCustomerInfoToStripeAccount({
        paymentMethodID: paymentMethod?.id,
        accountID: window.accountId,
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
    }
  );

  return mutation;
};

export default postCustomerInfo;
