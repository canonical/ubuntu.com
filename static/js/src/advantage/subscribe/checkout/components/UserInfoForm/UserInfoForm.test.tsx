import React from "react";
import { QueryClient, QueryClientProvider } from "react-query";
import { Formik } from "formik";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { fireEvent, render, screen } from "@testing-library/react";
import UserInfoForm from "./UserInfoForm";

describe("UserInfoFormTests", () => {
  let queryClient: QueryClient;
  const stripePromise = loadStripe(window.stripePublishableKey ?? "");

  beforeEach(async () => {
    queryClient = new QueryClient();
  });

  it("cancel button resets user info values", () => {
    global.window = Object.create(window);
    Object.defineProperty(window, "accountId", { value: "ABCDEF" });

    const intialValues = {
      name: "Joe",
      organisationName: "Canonical",
      buyingFor: "organisation",
      address: "Adrs Street",
      city: "Citty",
      postalCode: "AB12 3CD",
      defaultPaymentMethod: {
        brand: "visa",
        country: "US",
        expMonth: 4,
        expYear: 2024,
        id: "pm_ABCDEF",
        last4: "4242",
      },
    };

    render(
      <QueryClientProvider client={queryClient}>
        <Formik initialValues={intialValues} onSubmit={jest.fn()}>
          <Elements stripe={stripePromise}>
            <UserInfoForm setError={jest.fn()} setCardValid={jest.fn()} />
          </Elements>
        </Formik>
      </QueryClientProvider>
    );

    fireEvent.click(screen.getByRole("button", { name: "Edit" }));
    fireEvent.change(screen.getByTestId("field-customer-name"), {
      target: { value: "Doe" },
    });
    fireEvent.change(screen.getByTestId("field-org-name"), {
      target: { value: "Canonical 2" },
    });
    fireEvent.change(screen.getByTestId("field-address"), {
      target: { value: "Address" },
    });
    fireEvent.change(screen.getByTestId("field-city"), {
      target: { value: "City" },
    });
    fireEvent.change(screen.getByTestId("field-post-code"), {
      target: { value: "ZX09 8YT" },
    });

    fireEvent.click(screen.getByRole("button", { name: "Cancel" }));

    expect(screen.getByTestId("customer-name")).toHaveTextContent("Joe");
    expect(screen.getByTestId("organisation-name")).toHaveTextContent(
      "Canonical"
    );
    expect(screen.getByTestId("customer-address")).toHaveTextContent(
      "Adrs Street"
    );
    expect(screen.getByTestId("customer-city")).toHaveTextContent("Citty");
    expect(screen.getByTestId("customer-postal-code")).toHaveTextContent(
      "AB12 3CD"
    );
  });
});
