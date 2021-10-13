import { useMutation } from "react-query";
import { postFreeTrial } from "../../../contracts-api";
import useProduct from "./useProduct";

const useFreeTrial = () => {
  const { product, quantity } = useProduct();

  const mutation = useMutation(async () => {
    if (!product) {
      throw new Error("Product missing");
    }

    const res = await postFreeTrial({
      accountID: window.accountId,
      products: [
        {
          name: product.name,
          period: product.period,
          price: product.price.value,
          product_listing_id: product.id,
          quantity: quantity,
        },
      ],
      previousPurchaseId: window.previousPurchaseIds?.[product.period],
    });

    if (res.errors) {
      throw new Error(res.errors);
    }

    return res.id;
  });

  return mutation;
};

export default useFreeTrial;
