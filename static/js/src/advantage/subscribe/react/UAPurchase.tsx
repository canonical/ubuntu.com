import React, { useContext } from "react";
import Form from "./components/Form";
import ProductSummary from "./components/ProductSummary";
import { FormContext } from "advantage/subscribe/react/utils/FormContext";
import {
  IoTDevices,
  ProductUsers,
  isIoTDevice,
  isPublicCloud,
} from "advantage/subscribe/react/utils/utils";
const UAPurchase = () => {
  const { productType, iotDevice, productUser } = useContext(FormContext);
  const disabled =
    productUser === ProductUsers.organisation &&
    (isPublicCloud(productType) ||
      (isIoTDevice(productType) && iotDevice === IoTDevices.core));

  return (
    <>
      <Form />
      {!disabled && <ProductSummary />}
    </>
  );
};

export default UAPurchase;
