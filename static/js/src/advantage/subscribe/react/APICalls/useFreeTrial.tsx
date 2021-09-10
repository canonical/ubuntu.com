import { useMutation } from "react-query";
import {
  postGuestFreeTrial,
  postLoggedInFreeTrial,
} from "../../../contracts-api";
import useProduct from "./useProduct";

import { FormValues } from "../utils/utils";

const FreeTrial = () => {
  const { product, quantity } = useProduct();

  const mutation = useMutation(async (formData: FormValues) => {
    if (!product) {
      throw new Error("Product missing");
    }

    const {
      name,
      organisationName,
      email,
      address,
      city,
      country,
      postalCode,
      usState,
      caProvince,
    } = formData;

    const addressObject = {
      city: city,
      country: country,
      line1: address,
      postal_code: postalCode,
      state: country === "US" ? usState : caProvince,
    };

    let res;

    if (window.isGuest) {
      res = await postGuestFreeTrial({
        email: email,
        account_name: organisationName,
        name: organisationName || name,
        address: addressObject,
        productListingId: product.id,
        quantity: quantity,
      });
    } else {
      res = await postLoggedInFreeTrial({
        accountID: window.accountId,
        name: organisationName || name,
        address: addressObject,
        productListingId: product.id,
        quantity: quantity,
      });
    }

    if (res.errors) {
      throw new Error(res.errors);
    }
    return res;
  });

  return mutation;
};

export default FreeTrial;
