import { Strip } from "@canonical/react-components";
import React from "react";
import MagicAttachCode from "./components/MagicAttachCode";
import MagicAttachDropdown from "./components/MagicAttachDropdown";

const MagicAttachWrapper = () => {
  const magicAttachCode = window.localStorage.getItem("magicAttachCode");
  const isLoggedIn = window.localStorage.getItem("isLoggedIn");
  return (
    <Strip className="p-strip--suru-topped">
      {magicAttachCode == null || isLoggedIn == "false" ? (
        <MagicAttachCode />
      ) : null}
      {magicAttachCode != null && isLoggedIn == "true" ? (
        <MagicAttachDropdown />
      ) : null}
    </Strip>
  );
};

export default MagicAttachWrapper;
