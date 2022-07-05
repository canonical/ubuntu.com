import { List } from "@canonical/react-components";
import React from "react";
import Quantity from "./Quantity";
import Support from "./Support";

const Form = () => {
  return (
    <form>
      <div className="row">
        <List
          className="subscribe-form"
          stepped
          items={[
            { title: "Choose your tech support", content: <Support /> },
            { title: "How many users?", content: <Quantity /> },
          ]}
        />
      </div>
    </form>
  );
};

export default Form;
