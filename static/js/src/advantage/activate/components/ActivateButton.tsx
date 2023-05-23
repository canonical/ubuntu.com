import { Button, Row, Input, Col, Form } from "@canonical/react-components";
import React from "react";

const ActivateButton = () => {
  return (
    <Row>
      <Form inline>
        <Input
          type="text"
          id="pro-activate-input"
          className="p-form__control"
          label="Enter your code"
          placeholder="Ex: 123CODE"
        />
        <Button appearance="positive" inline>
          Activate
        </Button>
      </Form>
    </Row>
  );
};
export default ActivateButton;
