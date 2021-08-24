import { useMutation } from "react-query";
import { postCustomerInfoForPurchasePreview } from "../../../contracts-api";

const usePostCustomerInfoForPurchasePreview = () => {
  const mutation = useMutation(async (formData) => {
    const {
      name,
      address,
      city,
      country,
      postalCode,
      usState,
      caProvince,
      VATNumber,
    } = formData;

    const addressObject = {
      city: city,
      country: country,
      line1: address,
      postal_code: postalCode,
      state: country === "US" ? usState : caProvince,
    };

    const res = await postCustomerInfoForPurchasePreview(
      window.accountId,
      name,
      addressObject,
      {
        type: "eu_vat",
        value: VATNumber,
      }
    );

    if (res.errors) {
      throw new Error(JSON.parse(res.errors).code);
    } else if (res.error) {
      throw new Error(res.error);
    }

    return res;
  });

  return mutation;
};

export default usePostCustomerInfoForPurchasePreview;
