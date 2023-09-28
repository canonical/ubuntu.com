import { useMutation } from "react-query";
import { retryPurchase } from "advantage/api/contracts";
import { Action, PaymentPayload, Product } from "../utils/types";

type Props = {
  product: Product;
  quantity: number;
  action: Action;
};

const postPurchase = () => {
  const mutation = useMutation<any, Error, Props>(
    async ({ product, quantity, action }: Props) => {
      if (window.currentPaymentId) {
        await retryPurchase(window.currentPaymentId);

        // prevent re-purchase attemp
        return window.currentPaymentId;
      }

      let payload: PaymentPayload = {
        account_id: window.accountId,
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
