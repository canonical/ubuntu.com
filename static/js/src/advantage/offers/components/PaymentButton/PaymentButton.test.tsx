import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { UAOffer } from "advantage/subscribe/checkout/utils/test/Mocks";
import PaymentButton from "./PaymentButton";

describe("PaymentButton", () => {
  it("sets session and redirects", () => {
    Object.defineProperty(window, "location", {
      value: {
        href: "/old/url",
      },
    });

    render(<PaymentButton product={UAOffer}></PaymentButton>);

    const paymentButton = screen.getByRole("button", {
      name: "Purchase",
    }) as HTMLInputElement;

    expect(paymentButton).toBeInTheDocument();

    userEvent.click(paymentButton);

    expect(window.location.href).toBe("/account/checkout");
    expect(localStorage.getItem("shop-checkout-data")).toBe(
      '{"product":{"longId":"oAaBbCcDdEe","period":"yearly","marketplace":"canonical-ua","id":"oAaBbCcDdEe","name":"1x Ubuntu Pro, 2x Ubuntu Pro (Infra)","price":{"value":50000},"canBeTrialled":false},"quantity":1,"action":"offer"}'
    );
  });
});
