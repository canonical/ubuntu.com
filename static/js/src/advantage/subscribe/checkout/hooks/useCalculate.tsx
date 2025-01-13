import { useQuery } from "@tanstack/react-query";
import { CheckoutProducts, TaxInfo } from "../utils/types";

type useCalculateProps = {
  products: CheckoutProducts[];
  isTaxSaved: boolean;
  country?: string;
  VATNumber?: string;
};

const useCalculate = ({
  products,
  country,
  VATNumber,
  isTaxSaved,
}: useCalculateProps) => {
  const { isLoading, isError, isSuccess, data, error, isFetching } = useQuery({
    queryKey: ["calculate"],
    queryFn: async () => {
      const marketplace = products[0].product.marketplace;
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
            products: products?.map((product) => {
              return {
                product_listing_id: product.product?.longId,
                quantity: product.quantity,
              };
            }),
            has_tax: !!VATNumber,
          }),
        },
      );

      const res = await response.json();

      if (res.errors) {
        throw new Error(res.errors);
      }

      const data: TaxInfo = res;
      return data;
    },
    retry: false,
    enabled: !!isTaxSaved && !!country && !window.accountId,
  });

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
