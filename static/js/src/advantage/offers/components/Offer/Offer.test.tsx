import React from "react";
import { render, screen } from "@testing-library/react";

import Offer from "./Offer";
import { ItemFactory, OfferFactory } from "../../tests/factories/offers";

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
});
