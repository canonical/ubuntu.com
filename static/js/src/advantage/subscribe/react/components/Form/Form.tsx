import React from "react";
import Support from "./Support";
import Type from "./Type";
import Version from "./Version";

const Form = () => {
  return (
    <form>
      <div className="row">
        <ol className="p-stepped-list col-12">
          <Type />
          <Version />
          <Support />
        </ol>
      </div>
    </form>
  );
};

export default Form;
