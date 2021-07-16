import React from "react";
import { shallow } from "enzyme";
import CostCalculatorForm from "./CostCalculatorForm";
import CostCalculations from "./CostCalculations";

describe("Hourly cost and total savings calculations", function () {
  let formWrapper;
  let calculationsWrapper;

  beforeEach(() => {
    formWrapper = shallow(<CostCalculatorForm />);
    calculationsWrapper = shallow(
      <CostCalculations
        instances={{ value: 1000, error: "" }}
        vcpus={{ value: 2, error: "" }}
        ephemeralStorage={{ value: 8, error: "" }}
        ram={{ value: 8, error: "" }}
        persistentStorage={{ value: 80, error: "" }}
        supportLevel="fully-managed"
      />
    );
  });

  afterEach(() => {
    formWrapper.unmount();
  });

  it("checks totals are correct with default values", () => {
    expect(calculationsWrapper.find("#hourly-cost").text()).toEqual("$0.0407");
    expect(calculationsWrapper.find("#total-savings").text()).toEqual(
      "$907,656"
    );
  });

  it("checks totals are correct when instances value is updated", () => {
    calculationsWrapper = shallow(
      <CostCalculations
        instances={{ value: 2000, error: "" }}
        vcpus={{ value: 2, error: "" }}
        ephemeralStorage={{ value: 8, error: "" }}
        ram={{ value: 8, error: "" }}
        persistentStorage={{ value: 80, error: "" }}
        supportLevel="fully-managed"
      />
    );
    expect(calculationsWrapper.find("#hourly-cost").text()).toEqual("$0.0243");
    expect(calculationsWrapper.find("#total-savings").text()).toEqual(
      "$2,675,637"
    );
  });

  it("checks totals are correct when vcpus value is updated", () => {
    calculationsWrapper = shallow(
      <CostCalculations
        instances={{ value: 1000, error: "" }}
        vcpus={{ value: 8, error: "" }}
        ephemeralStorage={{ value: 8, error: "" }}
        ram={{ value: 8, error: "" }}
        persistentStorage={{ value: 80, error: "" }}
        supportLevel="fully-managed"
      />
    );
    expect(calculationsWrapper.find("#hourly-cost").text()).toEqual("$0.0792");
    expect(calculationsWrapper.find("#total-savings").text()).toEqual(
      "$5,824,474"
    );
  });

  it("checks totals are correct when Ephemeral storage value is updated", () => {
    calculationsWrapper = shallow(
      <CostCalculations
        instances={{ value: 1000, error: "" }}
        vcpus={{ value: 2, error: "" }}
        ephemeralStorage={{ value: 16, error: "" }}
        ram={{ value: 8, error: "" }}
        persistentStorage={{ value: 80, error: "" }}
        supportLevel="fully-managed"
      />
    );
    expect(calculationsWrapper.find("#hourly-cost").text()).toEqual("$0.0407");
    expect(calculationsWrapper.find("#total-savings").text()).toEqual(
      "$2,883,912"
    );
  });

  it("checks totals are correct when ram value is updated", () => {
    calculationsWrapper = shallow(
      <CostCalculations
        instances={{ value: 1000, error: "" }}
        vcpus={{ value: 2, error: "" }}
        ephemeralStorage={{ value: 8, error: "" }}
        ram={{ value: 32, error: "" }}
        persistentStorage={{ value: 80, error: "" }}
        supportLevel="fully-managed"
      />
    );
    expect(calculationsWrapper.find("#hourly-cost").text()).toEqual("$0.0818");
    expect(calculationsWrapper.find("#total-savings").text()).toEqual(
      "$5,755,049"
    );
  });

  it("checks totals are correct when persistent storage value is updated", () => {
    calculationsWrapper = shallow(
      <CostCalculations
        instances={{ value: 1000, error: "" }}
        vcpus={{ value: 2, error: "" }}
        ephemeralStorage={{ value: 8, error: "" }}
        ram={{ value: 8, error: "" }}
        persistentStorage={{ value: 210, error: "" }}
        supportLevel="fully-managed"
      />
    );
    expect(calculationsWrapper.find("#hourly-cost").text()).toEqual("$0.0486");
    expect(calculationsWrapper.find("#total-savings").text()).toEqual(
      "$699,381"
    );
  });

  it("checks totals are correct when support level checkbox is changed", () => {
    calculationsWrapper = shallow(
      <CostCalculations
        instances={{ value: 1000, error: "" }}
        vcpus={{ value: 2, error: "" }}
        ephemeralStorage={{ value: 8, error: "" }}
        ram={{ value: 8, error: "" }}
        persistentStorage={{ value: 80, error: "" }}
        supportLevel="supported"
      />
    );
    expect(calculationsWrapper.find("#hourly-cost").text()).toEqual("$0.2064");
    expect(calculationsWrapper.find("#total-savings").text()).toEqual("$0");
  });

  it("check no value is shown in totals if error message is present", () => {
    calculationsWrapper = shallow(
      <CostCalculations
        instances={{ value: 0, error: "Number out of range" }}
        vcpus={{ value: 32, error: "" }}
        ephemeralStorage={{ value: 64, error: "" }}
        ram={{ value: 8, error: "" }}
        persistentStorage={{ value: 210, error: "" }}
        supportLevel="fully-managed"
      />
    );
    expect(calculationsWrapper.find("#hourly-cost").text()).toEqual("-");
    expect(calculationsWrapper.find("#total-savings").text()).toEqual("-");
  });

  it("checks error message exists when instances value is out of range", () => {
    formWrapper
      .find("#instances")
      .simulate("change", { target: { value: 0, name: "instances" } });

    expect(formWrapper.find(".p-form-validation__message")).toBeTruthy();
  });

  it("checks error message exists when vcpus value is out of range", () => {
    formWrapper
      .find("#vcpus")
      .simulate("change", { target: { value: 10000, name: "vcpus" } });

    expect(formWrapper.find(".p-form-validation__message")).toBeTruthy();
  });

  it("checks error message exists when ephemeral storage value is out of range", () => {
    formWrapper.find("#ephemeral-storage").simulate("change", {
      target: { value: "", name: "ephemeralStorage" },
    });

    expect(formWrapper.find(".p-form-validation__message")).toBeTruthy();
  });

  it("checks error message exists when ram value is out of range", () => {
    formWrapper.find("#ram").simulate("change", {
      target: { value: 376428, name: "ram" },
    });

    expect(formWrapper.find(".p-form-validation__message")).toBeTruthy();
  });

  it("checks error message exists when persistent storage value is out of range", () => {
    formWrapper.find("#persistent-storage").simulate("change", {
      target: { value: 0, name: "persistentStorage" },
    });

    expect(formWrapper.find(".p-form-validation__message")).toBeTruthy();
  });
});
