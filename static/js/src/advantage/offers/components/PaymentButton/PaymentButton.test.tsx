import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { UAOffer } from "advantage/subscribe/checkout/utils/test/Mocks";
import PaymentButton from "./PaymentButton";

describe("PaymentButton", () => {
  it("sets session and redirects", async () => {
    const originalLocation = window.location;
    const mockLocation = {
      href: "/old/url",
      assign: jest.fn(),
      replace: jest.fn(),
    };
    Object.defineProperty(window, "location", {
      value: mockLocation,
      writable: true,
    });

    window.location = {
      href: "/old/url",
      assign: jest.fn(),
    } as unknown as Location;

    const localStorageMock = (function () {
      let store: Record<string, string> = {};
      return {
        getItem(key: string) {
          return store[key] || null;
        },
        setItem(key: string, value: string) {
          store[key] = value.toString();
        },
        clear() {
          store = {};
        },
      };
    })();
    Object.defineProperty(window, "localStorage", {
      value: localStorageMock,
    });

    render(<PaymentButton product={UAOffer} />);

    const paymentButton = screen.getByRole("button", {
      name: "Purchase",
    }) as HTMLInputElement;

    expect(paymentButton).toBeInTheDocument();

    userEvent.click(paymentButton);

    await waitFor(() => {
      expect(window.location.href).toBe("/account/checkout");
      expect(localStorage.getItem("shop-checkout-data")).toBe(
        '{"products":[{"product":{"longId":"oAaBbCcDdEe","period":"yearly","marketplace":"canonical-ua","id":"oAaBbCcDdEe","name":"1x Ubuntu Pro, 2x Ubuntu Pro (Infra)","price":{"value":50000},"canBeTrialled":false},"quantity":1}],"action":"offer"}',
      );
    });

    window.location = originalLocation;
  });
});
