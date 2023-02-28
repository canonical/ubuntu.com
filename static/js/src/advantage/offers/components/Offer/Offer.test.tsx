import React from "react";
import { render, screen } from "@testing-library/react";

import Offer from "./Offer";
import {
  DiscountOfferFactory,
  ItemFactory,
  OfferFactory,
} from "../../tests/factories/offers";

describe("Offer", () => {
  it("displays an offer correctly", () => {
    const offer = OfferFactory.build({
      items: [
        ItemFactory.build({ id: "1", name: "Test", price: 42424 }),
        ItemFactory.build({ id: "2", name: "Toast" }),
      ],
      total: 123456,
    });
    render(<Offer offer={offer} />);
    expect(screen.getByText("Test")).toBeInTheDocument();
    expect(screen.getByText("$424.24")).toBeInTheDocument();
    expect(screen.getByText("Toast")).toBeInTheDocument();
    expect(screen.getByText("$1,234.56")).toBeInTheDocument();
    expect(screen.getByRole("button")).not.toBeDisabled();
  });

  it("displays a discount offer correctly", () => {
    const offer = DiscountOfferFactory.build({
      items: [
        ItemFactory.build({ id: "1", name: "Test", price: 40000 }),
        ItemFactory.build({ id: "2", name: "Toast", price: 300000 }),
      ],
      total: 340000,
    });
    console.log("offer", offer);
    render(<Offer offer={offer} />);
    expect(screen.getByText("Test")).toBeInTheDocument();
    expect(screen.getByText("$400.00")).toBeInTheDocument();
    expect(screen.getByText("$3,000.00")).toBeInTheDocument();
    expect(screen.getByText("$3,400.00")).toBeInTheDocument();
    expect(screen.getByText("- $357.00 (10.5%)")).toBeInTheDocument();
    expect(screen.getByText("$3,043.00")).toBeInTheDocument();
    expect(screen.getByRole("button")).not.toBeDisabled();
  });
});
