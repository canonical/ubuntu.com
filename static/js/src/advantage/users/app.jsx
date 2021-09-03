import React from "react";
import ReactDOM from "react-dom";
import AccountUsers from "./AccountUsers";

// TODO: replace with real data once API integration is complete
const mockData = {
  organisationName: "myOrganisation",
};

function App() {
  return <AccountUsers organisationName={mockData.organisationName} />;
}

ReactDOM.render(
  <App />,
  document.getElementById("advantage-account-users-app")
);
