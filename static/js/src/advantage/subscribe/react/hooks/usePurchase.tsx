import { useMutation } from "react-query";
import { postPurchaseData } from "../../../api/contracts";
import { Product as UAProduct } from "../utils/utils";
import { Product as BlenderProduct } from "advantage/subscribe/blender/utils/utils";

type Props = {
  quantity: number;
  product: UAProduct | BlenderProduct | null;
};

const usePurchase = ({ quantity, product }: Props) => {
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
      product?.marketplace
    );

    if (res.errors) {
      throw new Error(res.errors);
    }

    return res.id;
  });

  return mutation;
};

export default usePurchase;
