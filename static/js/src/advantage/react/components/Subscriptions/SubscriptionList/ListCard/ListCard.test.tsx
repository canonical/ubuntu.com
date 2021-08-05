import React from "react";
import { shallow } from "enzyme";

import ListCard from "./ListCard";

describe("ListCard", () => {
  it("renders", () => {
    const wrapper = shallow(
      <ListCard
        created="12.02.2021"
        expires="23.04.2022"
        features={["ESM Infra", "livepatch", "24/5 support"]}
        machines={10}
        label="Annual"
        title="Lorem ipsum dolor sit amet, consectetur adipiscing elit"
      />
    );
    expect(wrapper.find("Card").exists()).toBe(true);
  });
});
