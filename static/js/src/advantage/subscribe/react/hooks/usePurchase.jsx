import { useMutation } from "react-query";
import { postPurchaseData } from "../../../api/contracts";
import useProduct from "./useProduct";

const usePurchase = () => {
  const { product, quantity } = useProduct();

  const mutation = useMutation(async () => {
    if (!product) {
      throw new Error("Product missing");
    }

    let marketplace = window?.STATE?.product?.marketplace;

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
      window.previousPurchaseIds?.[product.period],
      marketplace
    );

    if (res.errors) {
      throw new Error(res.errors);
    }

    return res.id;
  });

  return mutation;
};

export default usePurchase;
