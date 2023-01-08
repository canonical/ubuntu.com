import { useMutation, useQueryClient } from "react-query";
import { CardElement, useElements, useStripe } from "@stripe/react-stripe-js";
import {
  ensurePurchaseAccount,
  postCustomerInfoToStripeAccount,
} from "advantage/api/contracts";
import {
  Product as BlenderProduct,
} from "advantage/subscribe/blender/utils/utils";
import {
  Action,
  FormValues,
  PaymentPayload,
  Product as UAProduct,
} from "../utils/types";
import useCustomerInfo from "./useCustomerInfo";

type Props = {
  formData: FormValues;
  product: UAProduct | BlenderProduct | undefined;
  quantity: number;
  action: Action;
};

const useFinishPurchase = () => {
  const stripe = useStripe();
  const elements = useElements();
  const { data: userInfo } = useCustomerInfo();
  const queryClient = useQueryClient();

  const mutation = useMutation(
    async ({ formData, product, quantity, action }: Props) => {
      if (!product) {
        throw new Error("Product missing");
      }
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

        paymentMethodId = paymentMethod?.id;
      }

      let accountRes = {
        accountID: window.accountId || window.tempAccountId,
        code: null,
        message: "",
      };

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
        } else {
          accountRes.accountID = accountRes.accountID;
          window.tempAccountId = accountRes.accountID;
        }
      }

      const customerInfoRes = await postCustomerInfoToStripeAccount({
        paymentMethodID: paymentMethodId,
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

      if (window.currentPaymentId) {
        queryClient.invalidateQueries("pendingPurchase");

        // prevent re-purchase attemp
        return window.currentPaymentId;
      }

      let payload: PaymentPayload = {
        account_id: accountRes.accountID,
        marketplace: product.marketplace,
        action: action,
        previous_purchase_id: window.previousPurchaseIds?.[product.period],
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

      // preview
      const previewReq = await fetch(
        `/pro/purchase/preview${window.location.search}`,
        {
          method: "POST",
          cache: "no-store",
          credentials: "include",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );
      const previewRes = await previewReq.json();

      if (previewRes.errors) {
        throw new Error(previewRes.errors);
      }

      // purhcase
      const pruchaseReq = await fetch(
        `/pro/purchase${window.location.search}`,
        {
          method: "POST",
          cache: "no-store",
          credentials: "include",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );
      const pruchaseRes = await pruchaseReq.json();

      if (pruchaseRes.errors) {
        throw new Error(pruchaseRes.errors);
      }

      return pruchaseRes.id;
    }
  );

  return mutation;
};

export default useFinishPurchase;
