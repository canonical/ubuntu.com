import React, { useContext } from "react";
import classNames from "classnames";
import { Col, Input, Row } from "@canonical/react-components";
import { FormContext } from "advantage/subscribe/react/utils/FormContext";
import {
  IoTDevices,
  isIoTDevice,
  isPublicCloud,
} from "advantage/subscribe/react/utils/utils";

const Quantity = () => {
  const { quantity, setQuantity, productType, iotDevice } = useContext(
    FormContext
  );

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (Number(event.target.value) > 0) {
      setQuantity(Number(event.target.value));
      localStorage.setItem(
        "pro-selector-quantity",
        JSON.stringify(Number(event.target.value))
      );
    } else {
      setQuantity("");
    }
  };

  return (
    <div
      className={classNames({
        "u-disable":
          isPublicCloud(productType) ||
          (isIoTDevice(productType) && iotDevice === IoTDevices.core),
      })}
      data-testid="wrapper"
    >
      <Row>
        <Col size={2}>
          <Input
            id="quantity-input"
            type="number"
            name="quantity"
            placeholder="0"
            min="1"
            max="1000"
            step="1"
            data-stage="form"
            onChange={handleChange}
            value={quantity}
            pattern="\d+"
            style={{ minWidth: "unset", width: "4rem" }}
            aria-label="For how many machines"
          />
        </Col>
      </Row>
    </div>
  );
};

export default Quantity;
