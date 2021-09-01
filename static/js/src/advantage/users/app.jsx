import React from "react";
import ReactDOM from "react-dom";

function App() {
  return (
    <div>
      <section className="p-strip">
        <div className="row">
          <div className="col-12">
            <h1>Account users</h1>
          </div>
        </div>
      </section>
    </div>
  );
}

ReactDOM.render(
  <App />,
  document.getElementById("advantage-account-users-app")
);
