import React from "react";
import TermsCheckbox from "./TermsCheckbox";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

const label = <p>I agree to the terms and conditions</p>;

describe("TermsCheckbox", () => {
  it("displays the label", () => {
    render(<TermsCheckbox label={label} setTermsChecked={() => {}} />);
    screen.getByText("I agree to the terms and conditions");
  });

  it("calls the setTermsChecked function when the box is checked", () => {
    const setTermsChecked = jest.fn();
    render(<TermsCheckbox label={label} setTermsChecked={setTermsChecked} />);
    userEvent.click(
      screen.getByLabelText("I agree to the terms and conditions")
    );
    expect(setTermsChecked).toHaveBeenCalledWith(true);
  });
});
