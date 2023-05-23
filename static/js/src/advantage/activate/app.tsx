import React from "react";
import ReactDOM from "react-dom";
import ActivateButton from "./components/ActivateButton";
import { Row } from "@canonical/react-components";

function App() {
  return (
    <section className="p-strip">
      <Row>
        <h2>Activate your Ubuntu Pro subscription</h2>
        <p>
          You are currently signed in as Leia RUFFINI. Make sure it is the
          account you will be using to manage your subscription. If not, log in
          to a different account.
        </p>
        <p>
          Your product key should be in the confirmation email you received
          after buying your Ubuntu Pro Desktop subscription.
        </p>
        <p>The activation key should look like this: 123CODE.</p>
      </Row>
      <ActivateButton />
    </section>
  );
}

ReactDOM.render(<App />, document.getElementById("react-root"));
