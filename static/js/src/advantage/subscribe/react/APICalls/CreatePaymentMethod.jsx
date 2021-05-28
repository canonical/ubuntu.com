import { CardElement, useElements, useStripe } from "@stripe/react-stripe-js";
import { useMutation } from "react-query";

const createPaymentMethod = () => {
  const stripe = useStripe();
  const elements = useElements();

  const mutation = useMutation((formData) => {
    const {
      name,
      email,
      address,
      city,
      country,
      postalCode,
      USState,
      CAProvince,
    } = formData;

    const card = elements.getElement(CardElement);

    const { error, paymentMethod } = stripe.createPaymentMethod({
      type: "card",
      card: card,
      billing_details: {
        name: name,
        email: email,
        address: {
          city: city,
          country: country,
          line1: address,
          postal_code: postalCode,
          state: country === "US" ? USState : CAProvince,
        },
      },
    });

    if (error) {
      throw new Error(error);
    }
    return paymentMethod;
  });

  return mutation;
};

export default createPaymentMethod;
