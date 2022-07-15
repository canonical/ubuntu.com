import { useContext } from "react";
import { useMutation } from "react-query";
import { postFreeTrial } from "../../../api/contracts";
import { FormContext } from "../utils/FormContext";

const useFreeTrial = () => {
  const { quantity, product } = useContext(FormContext);
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
          product_listing_id: product.longId,
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
