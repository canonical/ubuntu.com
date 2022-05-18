import React from "react";
import Type from "./Type";

const Form = () => {
  return (
    <form
      className="js-shop-form"
      // style="padding-top: 4rem"
    >
      <div className="row">
        <ol className="p-stepped-list col-12">
          <Type />
        </ol>
      </div>
    </form>
  );
};

export default Form;
