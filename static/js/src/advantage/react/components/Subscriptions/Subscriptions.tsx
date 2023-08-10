import { Strip } from "@canonical/react-components";
import React from "react";

import Content from "./Content";
import Notifications from "./Notifications";
import Landscape from "./Landscape/Landscape";

const Subscriptions = () => (
  <>
    <Strip className="u-no-padding--top" style={{ overflow: "unset" }}>
      <Notifications />
      <Content />
      <Landscape />
    </Strip>
  </>
);

export default Subscriptions;
