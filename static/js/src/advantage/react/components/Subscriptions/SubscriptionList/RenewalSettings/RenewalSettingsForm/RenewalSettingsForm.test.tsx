import React from "react";
import { mount } from "enzyme";

import RenewalSettingsForm from "./RenewalSettingsForm";
import { act } from "react-dom/test-utils";
import { ActionButton } from "@canonical/react-components";
import { Formik } from "formik";
import FormikField from "advantage/react/components/FormikField";

describe("RenewalSettingsFields", () => {
  it("closes the menu when clicking the cancel button", async () => {
    const onCloseMenu = jest.fn();
    const wrapper = mount(
      <Formik initialValues={{}} onSubmit={jest.fn()}>
        <RenewalSettingsForm onCloseMenu={onCloseMenu} />
      </Formik>
    );
    wrapper.find("Button[data-test='cancel-button']").simulate("click");
    wrapper.update();
    expect(onCloseMenu).toHaveBeenCalled();
  });

  it("disables the submit button when the form hasn't changed", async () => {
    const wrapper = mount(
      <Formik initialValues={{ shouldAutoRenew: true }} onSubmit={jest.fn()}>
        <RenewalSettingsForm onCloseMenu={jest.fn()} />
      </Formik>
    );
    expect(wrapper.find(ActionButton).prop("disabled")).toBe(true);
  });

  it("enables the submit button when the form has changed", async () => {
    const wrapper = mount(
      <Formik initialValues={{ mysub: true }} onSubmit={jest.fn()}>
        <RenewalSettingsForm onCloseMenu={jest.fn()}>
          <FormikField name="mysub" type="checkbox" />
        </RenewalSettingsForm>
      </Formik>
    );
    await act(async () => {
      wrapper.find("input").simulate("change", {
        target: { name: "mysub", value: false },
      });
    });
    wrapper.update();
    expect(wrapper.find(ActionButton).prop("disabled")).toBe(false);
  });
});
