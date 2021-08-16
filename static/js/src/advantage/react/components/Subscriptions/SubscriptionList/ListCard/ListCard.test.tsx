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
        onClick={jest.fn()}
        title="Lorem ipsum dolor sit amet, consectetur adipiscing elit"
      />
    );
    expect(wrapper.find("Card").exists()).toBe(true);
  });

  it("can be marked as selected", () => {
    const wrapper = shallow(
      <ListCard
        created="12.02.2021"
        features={["ESM Infra", "livepatch", "24/5 support"]}
        isSelected={true}
        machines={10}
        label="Annual"
        onClick={jest.fn()}
        title="Lorem ipsum dolor sit amet, consectetur adipiscing elit"
      />
    );
    expect(wrapper.find("Card").hasClass("is-active")).toBe(true);
  });

  it("calls the onclick function when the card is clicked", () => {
    const onClick = jest.fn();
    const wrapper = shallow(
      <ListCard
        created="12.02.2021"
        features={["ESM Infra", "livepatch", "24/5 support"]}
        isSelected={true}
        machines={10}
        label="Annual"
        onClick={onClick}
        title="Lorem ipsum dolor sit amet, consectetur adipiscing elit"
      />
    );
    wrapper.find("Card").simulate("click");
    expect(onClick).toHaveBeenCalled();
  });
});
