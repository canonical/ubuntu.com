import { List } from "@canonical/react-components";
import React from "react";
import Feature from "./Feature";
import Quantity from "./Quantity";
import Support from "./Support";
import Type from "./Type";
import Version from "./Version";

const Form = () => {
  return (
    <form>
      <div className="row">
        <List
          className="subscribe-form"
          stepped
          items={[
            { title: "What are you setting up?", content: <Type /> },
            {
              title: "What Ubuntu version are you running?",
              content: <Version />,
            },
            ...(true
              ? [
                  {
                    title: "Select your feature coverage",
                    content: <Feature />,
                  },
                ]
              : []),
            { title: "Do you also want tech support?", content: <Support /> },
            { title: "How many?", content: <Quantity /> },
          ]}
        />
      </div>
    </form>
  );
};

export default Form;
