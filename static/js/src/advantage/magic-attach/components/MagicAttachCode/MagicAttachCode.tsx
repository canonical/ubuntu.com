import { Button, Input } from "@canonical/react-components";
import React, { ChangeEvent, Dispatch, SetStateAction } from "react";

type Props = {
  setCodeStatus: Dispatch<SetStateAction<boolean>>;
  setMagicAttachCode: Dispatch<SetStateAction<string>>;
};
const MagicAttachCode = ({ setCodeStatus, setMagicAttachCode }: Props) => {
  return (
    <>
      <Input
        type="text"
        id="exampleTextInput3"
        label="magicAttachCode"
        onChange={(event: ChangeEvent<HTMLInputElement>) => {
          setMagicAttachCode(event.target.value);
        }}
      />
      <Button
        onClick={() => {
          setCodeStatus(true);
        }}
      >
        Submit
      </Button>
    </>
  );
};

export default MagicAttachCode;
