import React from "react";
import { shallow } from "enzyme";

import { makeInteractiveProps } from "./makeInteractiveProps";

describe("makeInteractiveProps", () => {
  it("calls the callback on click", () => {
    const onClick = jest.fn();
    const wrapper = shallow(<div {...makeInteractiveProps(onClick)}></div>);
    wrapper.simulate("click", {});
    expect(onClick).toHaveBeenCalled();
  });

  it("calls the callback when enter is pressed", () => {
    const onClick = jest.fn();
    const wrapper = shallow(<div {...makeInteractiveProps(onClick)}></div>);
    wrapper.simulate("keypress", { key: "Enter", preventDefault: jest.fn() });
    expect(onClick).toHaveBeenCalled();
  });

  it("calls the callback when spacebar is pressed", () => {
    const onClick = jest.fn();
    const wrapper = shallow(<div {...makeInteractiveProps(onClick)}></div>);
    wrapper.simulate("keypress", { key: " ", preventDefault: jest.fn() });
    expect(onClick).toHaveBeenCalled();
  });
});
