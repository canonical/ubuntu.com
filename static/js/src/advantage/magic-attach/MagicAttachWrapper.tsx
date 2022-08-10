import { Strip } from "@canonical/react-components";
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
    </Strip>
  );
};

export default MagicAttachWrapper;
