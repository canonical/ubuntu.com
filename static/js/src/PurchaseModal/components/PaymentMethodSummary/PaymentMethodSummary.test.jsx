import React from "react";
import { shallow } from "enzyme";
import PaymentMethodSummary from "./PaymentMethodSummary";
import * as useStripeCustomerInfo from "../../hooks/useStripeCustomerInfo";

import { userInfo } from "../../utils/test/Mocks";

describe("PaymentMethodSummary", () => {
  it("renders correctly", () => {
    jest.spyOn(useStripeCustomerInfo, "default").mockImplementation(() => {
      return { data: userInfo };
    });

    const setStep = jest.fn();
    const wrapper = shallow(<PaymentMethodSummary setStep={setStep} />);

    expect(wrapper.find("[data-test='email']").text()).toEqual(
      "tim.bisley@spaced.com"
    );
    expect(wrapper.find("[data-test='name']").text()).toEqual("Tim Bisley");
    expect(wrapper.find("[data-test='card']").text()).toEqual(
      "mastercard ending in 4444"
    );
    expect(wrapper.find("[data-test='expiry-date']").text()).toEqual("04/44");
  });

  it("calls the setStep function with 1 when the change... button is clicked", () => {
    const setStep = jest.fn();
    shallow(<PaymentMethodSummary setStep={setStep} />)
      .find("Button")
      .simulate("click");
    expect(setStep).toHaveBeenCalledWith(1);
  });
});
