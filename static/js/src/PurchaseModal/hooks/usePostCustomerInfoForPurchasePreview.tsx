import { useMutation } from "react-query";
import { postCustomerInfoForPurchasePreview } from "../../advantage/api/contracts";
import { FormValues } from "../utils/utils";

const usePostCustomerInfoForPurchasePreview = () => {
  const mutation = useMutation(async (formData: FormValues) => {
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

    if (window.accountId) {
      const res = await postCustomerInfoForPurchasePreview(
        window.accountId,
        name,
        addressObject,
        {
          type: country === "ZA" ? "za_vat" : "eu_vat",
          value: VATNumber,
        }
      );

      if (res.errors) {
        let error = "";
        try {
          error = JSON.parse(res.errors).code;
        } catch (e) {
          error = res.errors;
        }
        throw new Error(error);
      }

      return res;
    } else {
      throw new Error("missing accountId");
    }
  });

  return mutation;
};

export default usePostCustomerInfoForPurchasePreview;
