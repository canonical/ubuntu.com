import { useMutation } from "react-query";
import { postPurchaseData } from "../api/purchase";

const usePurchase = (productListingId: string) => {
  const mutation = useMutation(async () => {
    if (!window.accountId) {
      throw new Error("Account ID missing");
    }

    const res = await postPurchaseData(
      window.accountId,
      productListingId,
      false
    );

    if (res.errors) {
      throw new Error(res.errors);
    }

    return res.id;
  });

  return mutation;
};

export default usePurchase;
