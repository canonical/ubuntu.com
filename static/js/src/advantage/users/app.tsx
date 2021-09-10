import React from "react";
import ReactDOM from "react-dom";
import AccountUsers from "./AccountUsers";

// TODO: replace with real data once API integration is complete
import { mockData } from "./mockData";

function App() {
  return (
    <AccountUsers
      organisationName={mockData.organisationName}
      users={mockData.users}
    />
  );
}

ReactDOM.render(
  <App />,
  document.getElementById("advantage-account-users-app")
);
