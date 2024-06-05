import { useMutation } from "react-query";
import { retryPurchase } from "advantage/api/contracts";
import {
  Action,
  Coupon,
  CheckoutProducts,
  PaymentPayload,
} from "../utils/types";
import { UserSubscriptionMarketplace } from "advantage/api/enum";

type Props = {
  products: CheckoutProducts[];
  action: Action;
  coupon?: Coupon;
};

const postPurchase = () => {
  const mutation = useMutation<any, Error, Props>(
    async ({ products, action, coupon }: Props) => {
      if (window.currentPaymentId) {
        await retryPurchase(window.currentPaymentId);

        // prevent re-purchase attemp
        return window.currentPaymentId;
      }

      const marketplace = products[0].product.marketplace;
      let payload: PaymentPayload;

      if (marketplace !== UserSubscriptionMarketplace.CanonicalProChannel) {
        const product = products[0].product;

        payload = {
          account_id: window.accountId,
          marketplace: marketplace,
          action: action,
          coupon: coupon,
        };

        if (window.previousPurchaseIds !== undefined && product.period) {
          payload.previous_purchase_id =
            window.previousPurchaseIds?.[product.period];
        }

        if (action === "purchase" || action === "trial") {
          payload = {
            ...payload,
            products: products.map((product) => {
              return {
                product_listing_id: product?.product?.longId,
                quantity: product.quantity,
              };
            }),
          };
        }

        if (products && products.length === 1) {
          const product = products[0].product;
          if (action === "renewal") {
            payload = { ...payload, renewal_id: product.longId };
          }

          if (action === "offer") {
            payload = { ...payload, offer_id: product.longId };
          }
        }
      } else {
        const product = products[0].product;

        payload = {
          account_id: window.accountId,
          marketplace: marketplace,
          action: action,
          offer_id: product?.offerId,
          products: products.map((product) => {
            return {
              product_listing_id: product?.product?.longId,
              quantity: product.quantity,
            };
          }),
        };
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
        if (
          previewRes.errors != "no invoice would be issued for this purchase"
        ) {
          throw new Error(previewRes.errors);
        }
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

export default postPurchase;
