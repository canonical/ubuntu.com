import React from "react";
import { mount } from "enzyme";

import RenewalSettingsFields from "./RenewalSettingsFields";
import { act } from "react-dom/test-utils";
import { ActionButton } from "@canonical/react-components";
import { Formik } from "formik";

describe("RenewalSettingsFields", () => {
  it("closes the menu when clicking the cancel button", async () => {
    const onCloseMenu = jest.fn();
    const wrapper = mount(
      <Formik initialValues={{}} onSubmit={jest.fn()}>
        <RenewalSettingsFields onCloseMenu={onCloseMenu} />
      </Formik>
    );
    wrapper.find("Button[data-test='cancel-button']").simulate("click");
    wrapper.update();
    expect(onCloseMenu).toHaveBeenCalled();
  });

  it("disables the submit button when the form hasn't changed", async () => {
    const wrapper = mount(
      <Formik initialValues={{ shouldAutoRenew: true }} onSubmit={jest.fn()}>
        <RenewalSettingsFields onCloseMenu={jest.fn()} />
      </Formik>
    );
    expect(wrapper.find(ActionButton).prop("disabled")).toBe(true);
  });

  it("enables the submit button when the form has changed", async () => {
    const wrapper = mount(
      <Formik initialValues={{ shouldAutoRenew: true }} onSubmit={jest.fn()}>
        <RenewalSettingsFields onCloseMenu={jest.fn()} />
      </Formik>
    );
    await act(async () => {
      wrapper.find("input[name='shouldAutoRenew']").simulate("change", {
        target: { name: "shouldAutoRenew", value: false },
      });
    });
    wrapper.update();
    expect(wrapper.find(ActionButton).prop("disabled")).toBe(false);
  });
});
