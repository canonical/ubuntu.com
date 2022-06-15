import { useContext } from "react";
import { useMutation } from "react-query";
import { postPurchaseData } from "../../../api/contracts";
import { FormContext } from "../utils/FormContext";

const usePurchase = () => {
  const { quantity, product } = useContext(FormContext);
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
          product_listing_id: product.longId,
          quantity: quantity,
        },
      ],
      window.previousPurchaseIds?.[product.period],
      window?.STATE?.product?.marketplace
    );

    if (res.errors) {
      throw new Error(res.errors);
    }

    return res.id;
  });

  return mutation;
};

export default usePurchase;
