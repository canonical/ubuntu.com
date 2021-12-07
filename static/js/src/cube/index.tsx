import React from "react";
import ReactDOM from "react-dom";
import MicrocertsTableApp from "./microcerts-table-app";
import HeaderApp from "./header-app";

ReactDOM.render(<HeaderApp />, document.getElementById("cube-header-app"));

ReactDOM.render(
  <MicrocertsTableApp />,
  document.getElementById("microcerts-table-app")
);
