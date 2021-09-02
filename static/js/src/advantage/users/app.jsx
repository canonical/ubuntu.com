import React from "react";
import ReactDOM from "react-dom";
import Organisation from "./components/Organisation";

function App() {
  return (
    <div>
      <div className="p-strip">
        <div className="row">
          <div className="col-12">
            <h1>Account users</h1>
          </div>
        </div>
      </div>
      <section>
        <div className="row">
          <Organisation name="myOrganisation" />
        </div>
      </section>
    </div>
  );
}

ReactDOM.render(
  <App />,
  document.getElementById("advantage-account-users-app")
);
