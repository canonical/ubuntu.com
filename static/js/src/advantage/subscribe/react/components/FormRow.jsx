import React from "react";
import { Row, Col } from "@canonical/react-components";

const formRow = ({ label, children, error }) => {
  return (
    <Row className="p-form__group  u-no-padding u-vertically-center">
      <Col size="4">
        <label className="u-no-padding--top">{label}</label>
      </Col>

      <Col size="8">{children}</Col>

      {error && (
        <Col size="8" emptyLarge="5">
          <span id="card-errors" className="p-form-validation__message">
            {error}
          </span>
        </Col>
      )}
    </Row>
  );
};

export default formRow;
