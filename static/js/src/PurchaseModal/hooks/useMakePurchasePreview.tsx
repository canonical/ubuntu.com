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
  action: "purchase" | "resize" | "trial";
};

const useMakePurchasePreview = () => {
  const mutation = useMutation(
    async ({ formData, product, quantity, marketplace, action }: Props) => {
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

      const addressObject = {
        city: city,
        country: country,
        line1: address,
        postal_code: postalCode,
        state: country === "US" ? usState : caProvince,
      };

      const previewRes = await fetch(
        `/pro/purchase/preview${window.location.search}`,
        {
          method: "POST",
          cache: "no-store",
          credentials: "include",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            customer_info: {
              payment_method_id: "",
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
            marketplace: marketplace,
            action: action, // can be resize or trial too
            previous_purchase_id: window.previousPurchaseIds?.[product.period],
            captcha_value: captchaValue,
          }),
        }
      );
      const data = await previewRes.json();
      return data.id;

      return true;
    }
  );

  return mutation;
};

export default useMakePurchasePreview;
