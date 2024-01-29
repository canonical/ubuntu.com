import React, { useContext } from "react";
import Form from "./components/Form";
import ProductSummary from "./components/ProductSummary";
import { FormContext } from "advantage/subscribe/react/utils/FormContext";
import {
  ProductUsers,
  isIoTDevice,
  isPublicCloud,
} from "advantage/subscribe/react/utils/utils";
const UAPurchase = () => {
  const { productType, productUser } = useContext(FormContext);
  const disabled =
    productUser === ProductUsers.organisation &&
    (isPublicCloud(productType) || isIoTDevice(productType));

  return (
    <>
      <Form />
      {!disabled && <ProductSummary />}
    </>
  );
};

export default UAPurchase;
