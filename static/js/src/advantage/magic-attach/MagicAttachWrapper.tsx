import { Row, Strip } from "@canonical/react-components";
import React from "react";
import MagicAttachCode from "./components/MagicAttachCode";

const MagicAttachWrapper = () => {
  return (
    <Strip className="p-strip--suru-topped">
      <Row className="u-vertically-center">
        <MagicAttachCode />
      </Row>
    </Strip>
  );
};

export default MagicAttachWrapper;
