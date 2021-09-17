import React from "react";
import ReactDOM from "react-dom";
import MicrocertificationsTable from "./components/MicrocertificationsTable";

function App() {
  return (
    <section className="p-strip">
      <div className="u-fixed-width">
        <h2>Microcertifications</h2>
        <MicrocertificationsTable />
      </div>
    </section>
  );
}

ReactDOM.render(
  <App />,
  document.getElementById("micro-certification-table-app")
);
