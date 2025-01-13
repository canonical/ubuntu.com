import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { BlenderProduct } from "advantage/subscribe/checkout/utils/test/Mocks";
import { FormProvider } from "../../utils/FormContext";
import { Periods, ProductListings, Support } from "../../utils/utils";
import PaymentButton from "./PaymentButton";

describe("PaymentButton", () => {
  beforeAll(() => {
    global.window.blenderProductList = {
      "blender-support-standard-yearly": BlenderProduct,
    } as ProductListings;
  });

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

    render(
      <FormProvider
        initialSupport={Support.standard}
        initialQuantity={2}
        initialPeriod={Periods.yearly}
      >
        <PaymentButton />
      </FormProvider>,
    );

    const paymentButton = screen.getByRole("button", {
      name: /Buy now/i,
    });

    expect(paymentButton).toBeInTheDocument();

    userEvent.click(paymentButton);

    await waitFor(() => {
      expect(window.location.href).toBe("/account/checkout");
      expect(localStorage.getItem("shop-checkout-data")).toBe(
        '{"products":[{"product":{"longId":"lANXjQ-H8fzvf_Ea8bIK1KW7Wi2W0VHnV0ZUsrEGbUiQ","period":"yearly","marketplace":"blender","id":"blender-support-standard-yearly","name":"Blender Support Yearly","price":{"value":50000},"canBeTrialled":false},"quantity":2}],"action":"purchase"}',
      );
    });

    window.location = originalLocation;
  });
});
