import { useCallback, useState } from "react";
import { useQuery } from "react-query";
import useProduct from "./Product";
import useSubscriptions from "./Subscriptions";

const usePurchase = () => {
  const { data: subscriptions } = useSubscriptions();
  const { product, quantity } = useProduct();

  const [isPurchaseActive, setPurchaseActive] = useState(false);

  const { isLoading, isError, isSuccess, data, error } = useQuery(
    ["purchase", product],
    async () => {
      var numberAlreadyOwned = 0;

      subscriptions[product.period].purchasedProductListings.forEach(
        (listing) => {
          if (listing.productListing.id === product.id) {
            numberAlreadyOwned = listing.value;
          }
        }
      );

      const response = await fetch(
        `/ua-contracts/v1/marketplace/canonical-ua/purchase`,
        {
          method: "POST",
          cache: "no-store",
          credentials: "include",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            accountID: window.accountId,
            purchaseItems: [
              {
                productListingID: product.id,
                metric: "active-machines",
                value: quantity + numberAlreadyOwned,
              },
            ],
            previousPurchaseId: window.previousPurchaseIds[product.period],
          }),
        }
      );
      if (!response.ok) {
        throw new Error(response.statusText);
      }
      return response.json();
    },
    {
      enabled:
        !!window.accountId && product && !!subscriptions && isPurchaseActive,
    }
  );

  const makePurchase = useCallback(() => setPurchaseActive(true), []);

  return {
    makePurchase: makePurchase,
    isLoading: isLoading,
    isError: isError,
    isSuccess: isSuccess,
    data: data,
    error: error,
  };
};

export default usePurchase;
