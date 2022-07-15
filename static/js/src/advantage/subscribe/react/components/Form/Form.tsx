import { List } from "@canonical/react-components";
import React from "react";
import { shouldShowApps } from "../../utils/utils";
import Feature from "./Feature";
import Quantity from "./Quantity";
import Support from "./Support";
import ProductType from "./ProductType";
import Version from "./Version";

const Form = () => {
  return (
    <form>
      <div className="row">
        <List
          className="subscribe-form"
          stepped
          items={[
            { title: "What are you setting up?", content: <ProductType /> },
            {
              title: "What Ubuntu version are you running?",
              content: <Version />,
            },
            ...(shouldShowApps()
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
