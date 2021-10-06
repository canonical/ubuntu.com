import { useMutation } from "react-query";
import { postPurchaseData } from "../../../contracts-api";
import useProduct from "./useProduct";

const usePurchase = () => {
  const { product, quantity } = useProduct();

  const mutation = useMutation(async () => {
    if (!product) {
      throw new Error("Product missing");
    }

    const res = await postPurchaseData(
      window.accountId,
      [
        {
          name: product.name,
          period: product.period,
          price: product.price.value,
          product_listing_id: product.id,
          quantity: quantity,
        },
      ],
      window.previousPurchaseIds?.[product.period]
    );

    if (res.errors) {
      throw new Error(res.errors);
    }

    return res.id;
  });

  return mutation;
};

export default usePurchase;
