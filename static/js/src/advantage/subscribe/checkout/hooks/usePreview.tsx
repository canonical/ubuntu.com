import { useQuery } from "react-query";
import {
  Action,
  Coupon,
  CheckoutProducts,
  PaymentPayload,
  TaxInfo,
} from "../utils/types";
import useCustomerInfo from "./useCustomerInfo";
import { UserSubscriptionMarketplace } from "advantage/api/enum";

type Props = {
  products: CheckoutProducts[];
  action: Action;
  coupon?: Coupon;
};

const usePreview = ({ products, action, coupon }: Props) => {
  const { data: userInfo, isError: isUserInfoError } = useCustomerInfo();
  const { isLoading, isError, isSuccess, data, error, isFetching } = useQuery(
    ["preview", products],
    async () => {
      const marketplace = products[0].product.marketplace;

      let payload: PaymentPayload = {
        account_id: window.accountId,
        marketplace: marketplace,
        action: action,
        coupon: coupon,
        previous_purchase_id:
          window.previousPurchaseIds?.[products[0].product.period],
      };

      if (action === "purchase" || action === "trial") {
        payload = {
          ...payload,
          products: products.map((product) => {
            return {
              product_listing_id: product.product.longId,
              quantity: product.quantity,
            };
          }),
        };
      }

      if (action === "renewal") {
        payload = { ...payload, renewal_id: products[0].product.longId };
      }

      if (
        action === "offer" &&
        marketplace === UserSubscriptionMarketplace.CanonicalUA
      ) {
        payload = { ...payload, offer_id: products[0].product.longId };
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
        !!products &&
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
