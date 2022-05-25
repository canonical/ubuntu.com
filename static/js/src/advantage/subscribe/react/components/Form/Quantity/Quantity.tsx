import React, { useContext } from "react";
import { Col, Input, Row } from "@canonical/react-components";
import { FormContext } from "advantage/subscribe/react/utils/FormContext";
import { isPublicCloud } from "advantage/subscribe/react/utils/utils";

const Quantity = () => {
  const { quantity, setQuantity, type } = useContext(FormContext);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setQuantity(parseInt(event.target.value));
  };

  return (
    <div className={isPublicCloud(type) ? "u-disable" : ""}>
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
