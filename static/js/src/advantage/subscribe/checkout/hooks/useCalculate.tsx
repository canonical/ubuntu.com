import { useQuery } from "react-query";
import { UserSubscriptionMarketplace } from "advantage/api/enum";
import { TaxInfo } from "../utils/types";

type useCalculateProps = {
  marketplace: UserSubscriptionMarketplace;
  productListingId: string;
  quantity: number;
  isTaxSaved: boolean;
  country?: string;
  VATNumber?: string;
};

const useCalculate = ({
  quantity,
  marketplace,
  productListingId,
  country,
  VATNumber,
  isTaxSaved,
}: useCalculateProps) => {
  const { isLoading, isError, isSuccess, data, error, isFetching } = useQuery(
    ["calculate"],
    async () => {
      const response = await fetch(
        `/account/${marketplace}/purchase/calculate${window.location.search}`,
        {
          method: "POST",
          cache: "no-store",
          credentials: "include",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            country: country,
            products: [
              {
                product_listing_id: productListingId,
                quantity: quantity,
              },
            ],
            has_tax: !!VATNumber,
          }),
        }
      );

      const res = await response.json();

      if (res.errors) {
        throw new Error(res.errors);
      }

      const data: TaxInfo = res;

      return data;
    },
    {
      retry: false,
      enabled: !!isTaxSaved && !!country,
    }
  );

  return {
    isLoading: isLoading,
    isError: isError,
    isSuccess: isSuccess,
    data: data,
    error: error,
    isFetching: isFetching,
  };
};

export default useCalculate;
