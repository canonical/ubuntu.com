import { useMutation } from "react-query";
import { UserSubscriptionMarketplace } from "advantage/api/enum";

type useCalculateTaxesProps = {
  country?: string;
  productListing: string;
  quantity: number;
  VATNumber?: string;
  marketplace: UserSubscriptionMarketplace;
};

const useCalculateTaxes = ({
  country,
  productListing,
  quantity,
  VATNumber,
  marketplace,
}: useCalculateTaxesProps) => {
  const mutation = useMutation(async () => {
    if (!country) {
      throw new Error("Country is missing");
    }

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
  });

  return mutation;
};

export default useCalculateTaxes;
