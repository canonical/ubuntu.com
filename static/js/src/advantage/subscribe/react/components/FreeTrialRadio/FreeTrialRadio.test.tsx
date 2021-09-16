import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { add, format } from "date-fns";
import { formatter } from "../../../renderers/form-renderer";
import * as usePreview from "../../APICalls/usePreview";
import { preview } from "../../utils/test/Mocks";

import FreeTrialRadio from "./FreeTrialRadio";

const total = 123456;

jest.spyOn(usePreview, "default").mockImplementation(() => {
  return {
    isLoading: false,
    isError: false,
    isSuccess: true,
    data: { ...preview, total: total },
    error: null,
  };
});

it("displays a message explaining the trial if free trial is selected", () => {
  render(
    <FreeTrialRadio isUsingFreeTrial={true} setIsUsingFreeTrial={() => {}} />
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
    <FreeTrialRadio isUsingFreeTrial={false} setIsUsingFreeTrial={() => {}} />
  );
  expect(screen.queryByText("Your free trial ends:")).not.toBeInTheDocument();
});

it("calls the setIsUsingFreeTrial function when the radio is clicked", () => {
  const setIsUsingFreeTrial = jest.fn();
  render(
    <FreeTrialRadio
      isUsingFreeTrial={false}
      setIsUsingFreeTrial={setIsUsingFreeTrial}
    />
  );
  userEvent.click(screen.getByLabelText("Use free trial month"));
  expect(setIsUsingFreeTrial).toHaveBeenCalledWith(true);
  userEvent.click(screen.getByLabelText("Pay now"));
  expect(setIsUsingFreeTrial).toHaveBeenCalledWith(false);
});
