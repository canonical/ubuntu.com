import { Strip } from "@canonical/react-components";
import React from "react";

import Content from "./Content";
import Notifications from "./Notifications";

const Subscriptions = () => (
  <Strip className="u-no-padding--top" style={{ overflow: "unset" }}>
    <Notifications />
    <Content />
  </Strip>
);

export default Subscriptions;
