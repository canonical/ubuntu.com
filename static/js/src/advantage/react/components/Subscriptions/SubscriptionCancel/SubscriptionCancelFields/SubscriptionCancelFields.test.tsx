import React from "react";
import { mount } from "enzyme";
import { Formik } from "formik";

import SubscriptionCancelFields from "./SubscriptionCancelFields";

describe("SubscriptionCancelFields", () => {
  it("calls the is valid callback when the fields are filled out", () => {
    const setIsValid = jest.fn();
    const wrapper = mount(
      <Formik initialValues={{ cancel: "" }} onSubmit={jest.fn()}>
        <SubscriptionCancelFields setIsValid={setIsValid} />
      </Formik>
    );
    wrapper
      .find("input[name='cancel']")
      .simulate("change", { target: { name: "cancel", value: "cancel" } });
    expect(setIsValid).toHaveBeenCalledWith(true);
  });
  it("displays right title if it's a normal subscription", () => {
    const setIsValid = jest.fn();
    const wrapper = mount(
      <Formik initialValues={{ cancel: "" }} onSubmit={jest.fn()}>
        <SubscriptionCancelFields setIsValid={setIsValid} />
      </Formik>
    );
    wrapper.find("If you cancel this subscription");
    expect(setIsValid).toHaveBeenCalledWith(true);
  });
  it("displays right title if it's a trial", () => {
    const setIsValid = jest.fn();
    const isTrial = true;
    const wrapper = mount(
      <Formik initialValues={{ cancel: "" }} onSubmit={jest.fn()}>
        <SubscriptionCancelFields setIsValid={setIsValid} isTrial={isTrial} />
      </Formik>
    );
    wrapper.find("If you cancel this trial");
    expect(setIsValid).toHaveBeenCalledWith(true);
  });
});
