import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import DealRegistration from "./DealRegistration";
import {
  FormContext,
  defaultValues,
} from "advantage/distributor/utils/FormContext";
import { ChannelOfferFactory } from "advantage/offers/tests/factories/channelOffers";

const mockContextValue = {
  offer: ChannelOfferFactory.build({
    id: "1",
    end_user_account_name: "Enduser 1",
    reseller_account_name: "Reseller test",
    opportunity_number: "54321",
  }),
};

const renderComponent = () => {
  render(
    <FormContext.Provider value={{ ...defaultValues, ...mockContextValue }}>
      <DealRegistration />
    </FormContext.Provider>,
  );
};

describe("DealRegistration Component", () => {
  test("Should render correctly with context values", () => {
    renderComponent();
    expect(screen.getByText("Deal registration ID 54321")).toBeInTheDocument();
    expect(screen.getByText("Reseller test")).toBeInTheDocument();
    expect(screen.getByText("Enduser 1")).toBeInTheDocument();
  });
});
