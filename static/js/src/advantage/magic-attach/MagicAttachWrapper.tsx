import { Row, Strip } from "@canonical/react-components";
import React, { useState } from "react";
import MagicAttachCode from "./components/MagicAttachCode";
import MagicAttachDropdown from "./components/MagicAttachDropdown";

const queryParams = new URLSearchParams(window.location.search);
const selectedSubscription = queryParams.get("subscription");

const MagicAttachWrapper = () => {
  const [isCode, setCodeStatus] = useState(false);
  const [magicAttachCode, setMagicAttachCode] = useState<string>("");
  console.log(isCode);
  return (
    <Strip className="p-strip--suru-topped">
      <Row className="u-vertically-center">
        {isCode ? null : (
          <MagicAttachCode
            setCodeStatus={setCodeStatus}
            setMagicAttachCode={setMagicAttachCode}
          />
        )}
        {isCode ? (
          <MagicAttachDropdown
            selectedId={selectedSubscription ? selectedSubscription : ""}
            magicAttachCode={magicAttachCode}
          />
        ) : null}
      </Row>
    </Strip>
  );
};

export default MagicAttachWrapper;
