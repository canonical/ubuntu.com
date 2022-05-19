import React, { useContext } from "react";
import { Col, Input, Row } from "@canonical/react-components";
import { FormContext } from "advantage/subscribe/react/utils/FormContext";

const Support = () => {
  const { quantity, setQuantity } = useContext(FormContext);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setQuantity(parseInt(event.target.value));
  };

  return (
    <>
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
    </>
  );
};

export default Support;
