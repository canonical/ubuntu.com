import { useMutation } from "react-query";
import { postCustomerInfoForPurchasePreview } from "advantage/api/contracts";
import { FormValues } from "../utils/types";

type Props = {
  formData: FormValues;
};

const postCustomerTaxInfo = () => {
  const mutation = useMutation(async ({ formData }: Props) => {
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

    let accountRes = {
      accountID: window.accountId || window.tempAccountId,
      code: null,
      message: "",
    };

    const customerInfoRes = await postCustomerInfoForPurchasePreview(
      accountRes.accountID,
      name,
      addressObject,
      {
        type: country === "ZA" ? "za_vat" : "eu_vat",
        value: VATNumber,
      }
    );

    if (customerInfoRes.errors) {
      const errors = JSON.parse(customerInfoRes.errors);

      throw new Error(errors.code);
    }

    return customerInfoRes;
  });

  return mutation;
};

export default postCustomerTaxInfo;
