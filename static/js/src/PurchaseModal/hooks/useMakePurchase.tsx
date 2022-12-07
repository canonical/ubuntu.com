import { CardElement, useElements, useStripe } from "@stripe/react-stripe-js";
import { useMutation } from "react-query";
import { Action, FormValues, marketplace, Product } from "../utils/utils";
import useStripeCustomerInfo from "./useStripeCustomerInfo";

type Props = {
  formData: FormValues;
  product: Product;
  quantity: number;
  action: Action;
  preview: boolean;
};

type AddressObejct = {
  city?: string;
  country?: string;
  line1?: string;
  postal_code?: string;
  state?: string;
};

type Payload = {
  account_id?: string;
  customer_info: {
    payment_method_id: string;
    email?: string;
    name?: string;
    address: AddressObejct;
    tax_id: {
      type: string;
      value?: string;
    };
  };
  marketplace: marketplace;
  action: Action;
  previous_purchase_id?: string;
  captcha_value: string | null;
  products?: [
    {
      product_listing_id: string;
      quantity: number;
    }
  ];
  renewal_id?: string;
  offer_id?: string;
};

const useMakePurchase = () => {
  const stripe = useStripe();
  const elements = useElements();
  const { data: userInfo } = useStripeCustomerInfo();

  const mutation = useMutation(
    async ({ formData, product, quantity, action, preview }: Props) => {
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

      const addressObject: AddressObejct = {
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

      let payload: Payload = {
        account_id: window.accountId,
        customer_info: {
          payment_method_id: paymentMethodId,
          email: email,
          name: name,
          address: addressObject,
          tax_id: {
            type: country === "ZA" ? "za_vat" : "eu_vat",
            value: VATNumber,
          },
        },
        marketplace: product.marketplace,
        action: action,
        previous_purchase_id: window.previousPurchaseIds?.[product.period],
        captcha_value: captchaValue,
      };
      if (action === "purchase" || action === "trial") {
        payload = {
          ...payload,
          products: [
            {
              product_listing_id: product.longId,
              quantity: quantity,
            },
          ],
        };
      }

      if (action === "renewal") {
        payload = { ...payload, renewal_id: product.longId };
      }
      if (action === "offer") {
        payload = { ...payload, offer_id: product.longId };
      }

      let url = `/pro/purchase${window.location.search}`;
      if (preview == true) {
        url = `/pro/purchase/preview${window.location.search}`;
      }

      const response = await fetch(url, {
        method: "POST",
        cache: "no-store",
        credentials: "include",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });
      const res = await response.json();

      if (res.errors) {
        throw new Error(res.errors);
      }

      return res;
    }
  );

  return mutation;
};

export default useMakePurchase;
