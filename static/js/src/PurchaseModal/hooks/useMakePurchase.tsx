import { CardElement, useElements, useStripe } from "@stripe/react-stripe-js";
import { useMutation } from "react-query";
import { Action, FormValues, Product } from "../utils/utils";
import useStripeCustomerInfo from "./useStripeCustomerInfo";

type Props = {
  formData: FormValues;
  product: Product;
  quantity: number;
  action: Action;
};

const useMakePurchase = () => {
  const stripe = useStripe();
  const elements = useElements();
  const { data: userInfo } = useStripeCustomerInfo();

  const mutation = useMutation(
    async ({ formData, product, quantity, action }: Props) => {
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
        captchaValue,
      } = formData;

      const addressObject = {
        city: city,
        country: country,
        line1: address,
        postal_code: postalCode,
        state: country === "US" ? usState : caProvince,
      };

      let paymentMethodId = userInfo?.customerInfo?.defaultPaymentMethod?.id;

      if (!paymentMethodId) {
        const card = elements?.getElement(CardElement);

        if (!stripe || !card) {
          throw new Error("Stripe failed to initialise");
        }

        const {
          error,
          paymentMethod: newPaymentMethod,
        } = await stripe.createPaymentMethod({
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

        paymentMethodId = newPaymentMethod?.id;
      }

      const response = await fetch(`/pro/purchase${window.location.search}`, {
        method: "POST",
        cache: "no-store",
        credentials: "include",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          customer_info: {
            payment_method_id: paymentMethodId,
            email: email,
            name: name,
            address: addressObject,
            tax_id: {
              type: "",
              value: VATNumber,
            },
          },
          products: [
            {
              product_listing_id: product.longId,
              quantity: quantity,
            },
          ],
          marketplace: product.marketplace,
          action: action,
          previous_purchase_id: window.previousPurchaseIds?.[product.period],
          captcha_value: captchaValue,
        }),
      });
      const res = await response.json();

      if (res.errors) {
        throw new Error(res.errors);
      }

      return res.id;
    }
  );

  return mutation;
};

export default useMakePurchase;
