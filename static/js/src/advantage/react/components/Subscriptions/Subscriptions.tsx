import { Strip } from "@canonical/react-components";
import React from "react";

import Content from "./Content";
import Notifications from "./Notifications";

const Subscriptions = () => (
  <Strip>
    <Notifications />
    <Content />
  </Strip>
);

export default Subscriptions;
