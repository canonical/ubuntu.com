import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Formik } from "formik";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { fireEvent, render, screen } from "@testing-library/react";
import UserInfoForm from "./UserInfoForm";
import { UserSubscriptionMarketplace } from "advantage/api/enum";

describe("UserInfoFormTests", () => {
  let queryClient: QueryClient;
  const stripePromise = loadStripe(window.stripePublishableKey ?? "");

  beforeEach(async () => {
    queryClient = new QueryClient();
  });

  it("cancel button resets user info values", () => {
    global.window = Object.create(window);
    Object.defineProperty(window, "accountId", { value: "ABCDEF" });

    const initialValues = {
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
        <Formik initialValues={initialValues} onSubmit={jest.fn()}>
          <Elements stripe={stripePromise}>
            <UserInfoForm
              setError={jest.fn()}
              isCardSaving={false}
              setIsCardSaving={jest.fn()}
            />
          </Elements>
        </Formik>
      </QueryClientProvider>,
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
      "Canonical",
    );
    expect(screen.getByTestId("customer-address")).toHaveTextContent(
      "Adrs Street",
    );
    expect(screen.getByTestId("customer-city")).toHaveTextContent("Citty");
    expect(screen.getByTestId("customer-postal-code")).toHaveTextContent(
      "AB12 3CD",
    );
  });

  it("Channel user should be able to edit only card number", () => {
    global.window = Object.create(window);
    Object.defineProperty(window, "accountId", { value: "ABCDEF" });

    const initialValues = {
      name: "Min",
      marketplace: UserSubscriptionMarketplace.CanonicalProChannel,
      buyingFor: "organisation",
      organisationName: "Canonical",
      address: "ABC Street",
      city: "DEF City",
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
        <Formik initialValues={initialValues} onSubmit={jest.fn()}>
          <Elements stripe={stripePromise}>
            <UserInfoForm
              setError={jest.fn()}
              isCardSaving={false}
              setIsCardSaving={jest.fn()}
            />
          </Elements>
        </Formik>
      </QueryClientProvider>,
    );

    fireEvent.click(screen.getByRole("button", { name: "Edit" }));
    fireEvent.change(screen.getByTestId("field-card-number"), {
      target: { value: "1234 5678 1234 5678" },
    });

    expect(screen.getByTestId("customer-name")).toHaveTextContent("Min");
    expect(screen.getByTestId("organisation-name")).toHaveTextContent(
      "Canonical",
    );
    expect(screen.getByTestId("customer-address")).toHaveTextContent(
      "ABC Street",
    );
    expect(screen.getByTestId("customer-city")).toHaveTextContent("DEF City");
    expect(screen.getByTestId("customer-postal-code")).toHaveTextContent(
      "AB12 3CD",
    );
  });

  it("New channel users should be able to add their user info", () => {
    global.window = Object.create(window);
    Object.defineProperty(window, "accountId", { value: "ABCDEF" });

    const initialValues = {
      name: "Min",
      marketplace: UserSubscriptionMarketplace.CanonicalProChannel,
      buyingFor: "organisation",
      organisationName: "",
      address: "",
      city: "",
      postalCode: "",
      defaultPaymentMethod: null,
    };

    render(
      <QueryClientProvider client={queryClient}>
        <Formik initialValues={initialValues} onSubmit={jest.fn()}>
          <Elements stripe={stripePromise}>
            <UserInfoForm
              setError={jest.fn()}
              isCardSaving={false}
              setIsCardSaving={jest.fn()}
            />
          </Elements>
        </Formik>
      </QueryClientProvider>,
    );
    expect(
      screen.queryByRole("button", { name: "Edit" }),
    ).not.toBeInTheDocument();
    expect(screen.queryByTestId("customer-name")).not.toBeInTheDocument();
    expect(screen.queryByTestId("organisation-name")).not.toBeInTheDocument();
    expect(screen.queryByTestId("customer-address")).not.toBeInTheDocument();
    expect(screen.queryByTestId("customer-city")).not.toBeInTheDocument();
    expect(
      screen.queryByTestId("customer-postal-code"),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByTestId("user-info-save-button"),
    ).not.toBeInTheDocument();

    expect(screen.getByTestId("field-card-number")).toBeInTheDocument();
    expect(screen.getByTestId("field-customer-name")).toBeInTheDocument();
    expect(screen.getByTestId("field-org-name")).toBeInTheDocument();
    expect(screen.getByTestId("field-address")).toBeInTheDocument();
    expect(screen.getByTestId("field-city")).toBeInTheDocument();
    expect(screen.getByTestId("field-post-code")).toBeInTheDocument();
  });
});
