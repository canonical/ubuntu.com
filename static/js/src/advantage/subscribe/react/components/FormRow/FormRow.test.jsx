import React from "react";
import { shallow } from "enzyme";
import FormRow from "./FormRow";

describe("FormRow", () => {
  it("renders correctly", () => {
    const wrapper = shallow(
      <FormRow label="test-label">
        <input type="text">test-input</input>
      </FormRow>
    );

    expect(wrapper.find("label").text()).toBe("test-label");
    expect(wrapper.find("input").text()).toBe("test-input");
  });

  it("renders correctly with an error", () => {
    const wrapper = shallow(
      <FormRow label="test-label" error="test-error">
        <input type="text" id="test-input">
          Test
        </input>
      </FormRow>
    );

    expect(wrapper.find("label").text()).toBe("test-label");
    expect(wrapper.find("#card-errors").text()).toBe("test-error");
  });
});
