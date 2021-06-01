import { useQuery } from "react-query";
import { postPurchasePreviewData } from "../../../contracts-api";
import useProduct from "./Product";

const usePreview = () => {
  const { product, quantity } = useProduct();

  const { isLoading, isError, isSuccess, data, error } = useQuery(
    ["preview", product],
    async () => {
      // const res = await postPurchasePreviewData(
      //   window.accountId,
      //   [
      //     {
      //       name: product.name,
      //       period: product.period,
      //       price: product.price.value,
      //       product_listing_id: product.id,
      //       quantity: quantity,
      //     },
      //   ],
      //   window.previousPurchaseIds?.[product.period]
      // );
      const res = { errors: "blip blp" };

      if (res.errors) {
        console.log({ res });
        throw new Error("sds");
      }
      return res;
    },
    {
      enabled: !!window.accountId && !!product,
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
