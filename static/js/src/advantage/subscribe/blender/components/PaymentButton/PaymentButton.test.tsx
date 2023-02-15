import React from "react";
import { render, screen } from "@testing-library/react";
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

  it("sets session and redirects", () => {
    Object.defineProperty(window, "location", {
      value: {
        href: "/old/url",
      },
    });

    render(
      <FormProvider
        initialSupport={Support.standard}
        initialQuantity={2}
        initialPeriod={Periods.yearly}
      >
        <PaymentButton></PaymentButton>
      </FormProvider>
    );

    const paymentButton = screen.getByRole("button", {
      name: "Buy now",
    }) as HTMLInputElement;

    expect(paymentButton).toBeInTheDocument();

    userEvent.click(paymentButton);

    expect(window.location.href).toBe("/account/checkout");
    expect(localStorage.getItem("shop-checkout-data")).toBe(
      '{"product":{"longId":"lANXjQ-H8fzvf_Ea8bIK1KW7Wi2W0VHnV0ZUsrEGbUiQ","period":"yearly","marketplace":"blender","id":"blender-support-standard-yearly","name":"Blender Support Yearly","price":{"value":50000},"canBeTrialled":false},"quantity":2,"action":"purchase"}'
    );
  });
});
