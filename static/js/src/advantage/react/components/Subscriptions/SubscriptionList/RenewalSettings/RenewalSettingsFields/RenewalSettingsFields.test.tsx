import React from "react";
import { mount } from "enzyme";
import { Formik } from "formik";

import RenewalSettingsFields from "./RenewalSettingsFields";

describe("RenewalSettingsFields", () => {
  it("closes the form when the cancel button is clicked", () => {
    const setMenuOpen = jest.fn();
    const wrapper = mount(
      <Formik initialValues={{}} onSubmit={jest.fn()}>
        <RenewalSettingsFields setMenuOpen={setMenuOpen} />
      </Formik>
    );
    wrapper.find("Button[data-test='cancel-button']").simulate("click");
    expect(setMenuOpen).toHaveBeenCalled();
  });
});
