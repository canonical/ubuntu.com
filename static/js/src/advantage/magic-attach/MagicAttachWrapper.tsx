import { Row, Strip } from "@canonical/react-components";
import React from "react";
import MagicAttachCode from "./components/MagicAttachCode";
import MagicAttachDropdown from "./components/MagicAttachDropdown";

const queryParams = new URLSearchParams(window.location.search);
const selectedSubscription = queryParams.get("subscription");
const MagicAttachWrapper = () => {
  console.log(window.location.search);
  return (
    <Strip className="p-strip--suru-topped">
      <Row className="u-vertically-center">
        <MagicAttachCode />
        <MagicAttachDropdown selectedId={selectedSubscription} />
      </Row>
    </Strip>
  );
};

export default MagicAttachWrapper;
