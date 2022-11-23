import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { add, format } from "date-fns";

import FreeTrial from "./FreeTrial";
import { formatter } from "advantage/subscribe/react/utils/utils";

const total = 123456;

it("displays a message explaining the trial if free trial is selected", () => {
  render(
    <FreeTrial />
  );
  screen.getByText("Your free trial ends:");
  screen.getByText(
    `${format(
      add(new Date(), {
        months: 1,
      }),
      "dd MMMM yyyy"
    )} after which time you will be charged ${formatter.format(total / 100)}`
  );
});

it("does not display the message if pay now is selected", () => {
  render(
    <FreeTrial />
  );
  expect(screen.queryByText("Your free trial ends:")).not.toBeInTheDocument();
});

it("calls the setIsUsingFreeTrial function when the radio is clicked", () => {
  const setIsUsingFreeTrial = jest.fn();
  render(
    <FreeTrial />
  );
  userEvent.click(screen.getByLabelText("Use free trial month"));
  expect(setIsUsingFreeTrial).toHaveBeenCalledWith(true);
  userEvent.click(screen.getByLabelText("Pay now"));
  expect(setIsUsingFreeTrial).toHaveBeenCalledWith(false);
});
