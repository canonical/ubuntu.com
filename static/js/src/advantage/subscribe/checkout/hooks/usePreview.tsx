import { useQuery } from "react-query";
import { Action, PaymentPayload, Product, TaxInfo } from "../utils/types";
import useCustomerInfo from "./useCustomerInfo";

type Props = {
  quantity: number;
  product: Product;
  action: Action;
};

const usePreview = ({ quantity, product, action }: Props) => {
  const { data: userInfo, isError: isUserInfoError } = useCustomerInfo();
  const { isLoading, isError, isSuccess, data, error, isFetching } = useQuery(
    ["preview", product],
    async () => {
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

      const response = await fetch(
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
      const res = await response.json();

      if (res.errors) {
        if (res.errors != "no invoice would be issued for this purchase") {
          console.log(res.errors);
          throw new Error(res.errors);
        }

        return {
          currency: "USD",
          subtotal: 0,
          tax: 0,
          total: 0,
        };
      }

      const data: TaxInfo = {
        currency: res.currency,
        subtotal: res.total - res.tax_amount,
        tax: res.tax_amount,
        total: res.total,
        start_of_cycle: res.start_of_cycle,
        end_of_cycle: res.end_of_cycle,
      };

      return data;
    },
    {
      retry: false,
      enabled:
        !!window.accountId &&
        !window.currentPaymentId &&
        !!product &&
        !!userInfo?.accountInfo?.name &&
        !isUserInfoError,
    }
  );

  return {
    isLoading: isLoading,
    isError: isError,
    isSuccess: isSuccess,
    data: data,
    error: error,
    isFetching: isFetching,
  };
};

export default usePreview;
