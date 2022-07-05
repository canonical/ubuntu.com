import { useQuery } from "react-query";
import { postPurchasePreviewData } from "../../../api/contracts";
import useStripeCustomerInfo from "../../../../PurchaseModal/hooks/useStripeCustomerInfo";
import { useContext } from "react";
import { FormContext } from "../utils/FormContext";

const usePreview = () => {
  const { quantity, product } = useContext(FormContext);
  const { isError: isUserInfoError } = useStripeCustomerInfo();

  const { isLoading, isError, isSuccess, data, error } = useQuery(
    ["preview", product],
    async () => {
      if (!product) {
        throw new Error("Product missing");
      }

      const res = await postPurchasePreviewData(
        window.accountId,
        [
          {
            name: product.name,
            period: product.period,
            price: product.price.value,
            product_listing_id: product.longId,
            quantity: quantity,
          },
        ],
        window.previousPurchaseIds?.[product.period],
        window.STATE?.product?.marketplace
      );

      if (res.errors) {
        throw new Error(res.errors);
      }
      return res;
    },
    {
      enabled: !!window.accountId && !!product && !isUserInfoError,
    }
  );

  return {
    isLoading: isLoading,
    isError: isError,
    isSuccess: isSuccess,
    data: data,
    error: error,
  };
};

export default usePreview;
