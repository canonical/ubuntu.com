import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { add, format } from "date-fns";
import { formatter } from "../../../advantage/subscribe/renderers/form-renderer";
import { preview } from "../../utils/test/Mocks";

import FreeTrialRadio from "./FreeTrialRadio";

const total = 123456;

const previewData = { ...preview, total: total };

it("displays a message explaining the trial if free trial is selected", () => {
  render(
    <FreeTrialRadio
      preview={previewData}
      isUsingFreeTrial={true}
      setIsUsingFreeTrial={() => {}}
    />
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
    <FreeTrialRadio
      preview={previewData}
      isUsingFreeTrial={false}
      setIsUsingFreeTrial={() => {}}
    />
  );
  expect(screen.queryByText("Your free trial ends:")).not.toBeInTheDocument();
});

it("calls the setIsUsingFreeTrial function when the radio is clicked", () => {
  const setIsUsingFreeTrial = jest.fn();
  render(
    <FreeTrialRadio
      preview={previewData}
      isUsingFreeTrial={false}
      setIsUsingFreeTrial={setIsUsingFreeTrial}
    />
  );
  userEvent.click(screen.getByLabelText("Use free trial month"));
  expect(setIsUsingFreeTrial).toHaveBeenCalledWith(true);
  userEvent.click(screen.getByLabelText("Pay now"));
  expect(setIsUsingFreeTrial).toHaveBeenCalledWith(false);
});
