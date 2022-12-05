import {
  Button,
  Col,
  Row,
  Input,
} from "@canonical/react-components";
import React, {
  ChangeEvent,
  Dispatch,
  SetStateAction
} from "react";
import AttachInstructions from "../AttachInstructions";

type Props = {
  setCodeStatus: Dispatch<SetStateAction<boolean>>;
  setMagicAttachCode: Dispatch<SetStateAction<string>>;
};
const MagicAttachCode = ({ setCodeStatus, setMagicAttachCode }: Props) => {
  return (
    <>
      <Row>
        <Col
          size={6}
          className="inside col-12 col-start-large-4 u-align--center"
        >
          <Input
            type="text"
            id="exampleTextInput3"
            label="Enter the code displayed in your installation"
            onChange={(event: ChangeEvent<HTMLInputElement>) => {
              setMagicAttachCode(event.target.value);
            }}
          />
          <Button
            appearance="positive"
            onClick={() => {
              setCodeStatus(true);
            }}
          >
            Submit
          </Button>
        </Col>
      </Row>
    </>
  );
};

export default MagicAttachCode;
