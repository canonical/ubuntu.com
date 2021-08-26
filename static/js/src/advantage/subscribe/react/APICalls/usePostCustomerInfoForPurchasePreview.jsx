import { useMutation } from "react-query";
import { postCustomerInfoForPurchasePreview } from "../../../api/contracts";

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

    if (window.accountId) {
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
