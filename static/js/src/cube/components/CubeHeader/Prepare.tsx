import React from "react";

const Prepare = () => {
  return (
    <section className="p-strip--light is-slanted--top-right is-shallow">
      <div className="row">
        <div className="col-5" style={{ marginTop: "3rem" }}>
          <h2>Refresh your knowledge</h2>
          <p>
            <strong>Be prepared for every microcert</strong>
          </p>
          <p className="u-sv2">
            Check your baseline understanding of Ubuntu fundamentals and preview
            the exam experience in a practice environment.
          </p>
          <a href="/cube/study" className="p-button--positive">
            Prepare
          </a>
        </div>
      </div>
    </section>
  );
};

export default Prepare;
