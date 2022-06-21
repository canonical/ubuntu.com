import React, { useContext } from "react";
import classNames from "classnames";
import { Col, Input, Row } from "@canonical/react-components";
import { FormContext } from "advantage/subscribe/react/utils/FormContext";
import { isPublicCloud } from "advantage/subscribe/react/utils/utils";

const Quantity = () => {
  const { quantity, setQuantity, productType } = useContext(FormContext);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setQuantity(Number(event.target.value));
  };

  return (
    <div
      className={classNames({
        "u-disabled": isPublicCloud(productType),
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
          />
        </Col>
      </Row>
    </div>
  );
};

export default Quantity;
