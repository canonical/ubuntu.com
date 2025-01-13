import { Strip } from "@canonical/react-components";

import Content from "./Content";
import Notifications from "./Notifications";
import Landscape from "./Landscape";

const Subscriptions = () => (
  <Strip className="u-no-padding--top" style={{ overflow: "unset" }}>
    <Notifications />
    <Content />
    <Landscape />
  </Strip>
);

export default Subscriptions;
