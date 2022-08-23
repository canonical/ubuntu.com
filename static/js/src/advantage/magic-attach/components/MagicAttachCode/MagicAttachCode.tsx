import { Button, Col, Row, Input } from "@canonical/react-components";
import React, { ChangeEvent } from "react";

const onCodeSubmit = () => {
  if (window.localStorage.getItem("isLoggedIn") == "false") {
    window.location.href = "/login?next=/advantage/magic-attach";
  } else {
    window.location.reload();
  }
};
const MagicAttachCode = () => {
  return (
    <Row>
      <Col size={6} className="inside col-12 col-start-large-4 u-align--center">
        <Input
          type="text"
          id="exampleTextInput3"
          label="Enter the code displayed in your installation"
          onChange={(event: ChangeEvent<HTMLInputElement>) => {
            window.localStorage.setItem("magicAttachCode", event.target.value);
          }}
        />
        <Button appearance="positive" onClick={onCodeSubmit}>
          Submit
        </Button>
      </Col>
    </Row>
  );
};

export default MagicAttachCode;
