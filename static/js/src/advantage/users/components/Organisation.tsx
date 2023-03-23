import React from "react";

const Organisation = ({ name }: { name: string }) => (
  <>
    <p className="p-text--small-caps">organisation</p>
    <p className="p-heading--3 u-no-padding--top">{name}</p>
  </>
);

export default Organisation;
