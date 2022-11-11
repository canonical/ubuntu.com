import { useQueryClient, useMutation } from "react-query";
import * as Sentry from "@sentry/react";

type useCalculateTaxesProps = {
  country?: string;
  productListing: string;
  quantity: number;
  VATNumber?: string;
};

const useCalculateTaxes = ({
  country,
  productListing,
  quantity,
  VATNumber,
}: useCalculateTaxesProps) => {
  const queryClient = useQueryClient();
  const mutation = useMutation(
    async () => {
      if (!country) {
        throw new Error("Country is missing");
      }

      const response = await fetch(
        `/account/canonical-ua/purchase/calculate${window.location.search}`,
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
                product_listing_id: productListing,
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

      return res;
    },
    {
      onSuccess: (data) => {
        queryClient.setQueryData("taxCalulations", data);
      },
      onError: (error) => {
        Sentry.captureException(error);
      },
    }
  );

  return mutation;
};

export default useCalculateTaxes;
