import { useMutation } from "react-query";
import { marketplace } from "../../../PurchaseModal/utils/utils";

type usePurchaseOfferProps = {
  marketplace: marketplace;
  offerId: string;
  accountId: string;
};

const usePurchaseOffer = () => {
  const mutation = useMutation(
    async ({ marketplace, offerId, accountId }: usePurchaseOfferProps) => {
      const response = await fetch(`/pro/offer${window.location.search}`, {
        method: "POST",
        cache: "no-store",
        credentials: "include",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          marketplace: marketplace,
          offer_id: offerId,
          account_id: accountId,
        }),
      });

      const res = await response.json();

      if (res.errors) {
        throw new Error(res.errors);
      }

      return res.id;
    }
  );

  return mutation;
};

export default usePurchaseOffer;
