import React from "react";
import { QueryClient, QueryClientProvider } from "react-query";
import { Formik } from "formik";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { fireEvent, render, screen } from "@testing-library/react";
import { UAProduct } from "../../utils/test/Mocks";
import Taxes from "./Taxes";

describe("TaxesTests", () => {
  let queryClient: QueryClient;
  const stripePromise = loadStripe(window.stripePublishableKey ?? "");

  beforeEach(async () => {
    queryClient = new QueryClient();
  });

  it("renders country select correctly", () => {
    render(
      <QueryClientProvider client={queryClient}>
        <Formik initialValues={{}} onSubmit={jest.fn()}>
          <Elements stripe={stripePromise}>
            <Taxes
              product={UAProduct}
              quantity={1}
              setTaxSaved={jest.fn()}
              setError={jest.fn()}
            />
          </Elements>
        </Formik>
      </QueryClientProvider>
    );
    screen.getByText("Country/Region:");
    expect(screen.getByTestId("select-country")).toBeInTheDocument();
    screen.getByRole("button", { name: "Save" });
  });

  it("When non VAT Country is selected, VAT Number input does not displays", () => {
    render(
      <QueryClientProvider client={queryClient}>
        <Formik initialValues={{}} onSubmit={jest.fn()}>
          <Elements stripe={stripePromise}>
            <Taxes
              product={UAProduct}
              quantity={1}
              setError={jest.fn()}
              setTaxSaved={jest.fn()}
            />
          </Elements>
        </Formik>
      </QueryClientProvider>
    );

    expect(screen.getByTestId("select-country")).toBeInTheDocument();
    fireEvent.change(screen.getByTestId("select-country"), {
      target: { value: "JP" },
    });
  });

  it("When VAT country is selected, VAT Number input displays", () => {
    render(
      <QueryClientProvider client={queryClient}>
        <Formik initialValues={{}} onSubmit={jest.fn()}>
          <Elements stripe={stripePromise}>
            <Taxes
              product={UAProduct}
              quantity={1}
              setError={jest.fn()}
              setTaxSaved={jest.fn()}
            />
          </Elements>
        </Formik>
      </QueryClientProvider>
    );

    expect(screen.getByTestId("select-country")).toBeInTheDocument();
    fireEvent.change(screen.getByTestId("select-country"), {
      target: { value: "FR" },
    });

    expect(screen.getByText("VAT number:")).toBeInTheDocument();
  });

  it("When USA is selected, State select displays", () => {
    const { getByTestId } = render(
      <QueryClientProvider client={queryClient}>
        <Formik initialValues={{}} onSubmit={jest.fn()}>
          <Elements stripe={stripePromise}>
            <Taxes
              product={UAProduct}
              quantity={1}
              setError={jest.fn()}
              setTaxSaved={jest.fn()}
            />
          </Elements>
        </Formik>
      </QueryClientProvider>
    );
    fireEvent.change(getByTestId("select-country"), {
      target: { value: "US" },
    });
    expect(screen.getByText("State:")).toBeInTheDocument();
    fireEvent.change(getByTestId("select-state"), {
      target: { value: "Texas" },
    });
  });

  it("sets status right if country is stored", () => {
    global.window = Object.create(window);
    Object.defineProperty(window, "accountId", { value: "ABCDEF" });

    const intialValues = {
      country: "GB",
    };

    render(
      <QueryClientProvider client={queryClient}>
        <Formik initialValues={intialValues} onSubmit={jest.fn()}>
          <Elements stripe={stripePromise}>
            <Taxes
              product={UAProduct}
              quantity={1}
              setError={jest.fn()}
              setTaxSaved={jest.fn()}
            />
          </Elements>
        </Formik>
      </QueryClientProvider>
    );

    expect(screen.getByRole("button", { name: "Edit" })).toBeInTheDocument();
  });

  it("sets status right if country is not stored", () => {
    render(
      <QueryClientProvider client={queryClient}>
        <Formik initialValues={{}} onSubmit={jest.fn()}>
          <Elements stripe={stripePromise}>
            <Taxes
              product={UAProduct}
              quantity={1}
              setError={jest.fn()}
              setTaxSaved={jest.fn()}
            />
          </Elements>
        </Formik>
      </QueryClientProvider>
    );

    expect(screen.getByRole("button", { name: "Save" })).toBeInTheDocument();
  });

  it("cancel button resets tax step values", () => {
    global.window = Object.create(window);
    Object.defineProperty(window, "accountId", { value: "ABCDEF" });

    const intialValues = {
      country: "GB",
      VATNumber: "GB123123123",
    };

    render(
      <QueryClientProvider client={queryClient}>
        <Formik initialValues={intialValues} onSubmit={jest.fn()}>
          <Elements stripe={stripePromise}>
            <Taxes
              product={UAProduct}
              quantity={1}
              setError={jest.fn()}
              setTaxSaved={jest.fn()}
            />
          </Elements>
        </Formik>
      </QueryClientProvider>
    );

    fireEvent.click(screen.getByRole("button", { name: "Edit" }));
    fireEvent.change(screen.getByTestId("select-country"), {
      target: { value: "FR" },
    });
    fireEvent.change(screen.getByTestId("field-vat-number"), {
      target: { value: "FR123123123" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Cancel" }));
    expect(screen.getByTestId("country")).toHaveTextContent("United Kingdom");
    expect(screen.getByTestId("vat-number")).toHaveTextContent("GB123123123");

    fireEvent.click(screen.getByRole("button", { name: "Edit" }));
    fireEvent.change(screen.getByTestId("select-country"), {
      target: { value: "US" },
    });
    fireEvent.change(screen.getByTestId("select-state"), {
      target: { value: "AL" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Cancel" }));
    expect(screen.getByTestId("country")).toHaveTextContent("United Kingdom");
    expect(screen.getByTestId("vat-number")).toHaveTextContent("GB123123123");

    fireEvent.click(screen.getByRole("button", { name: "Edit" }));
    fireEvent.change(screen.getByTestId("select-country"), {
      target: { value: "CA" },
    });
    fireEvent.change(screen.getByTestId("select-ca-province"), {
      target: { value: "AL" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Cancel" }));
    expect(screen.getByTestId("country")).toHaveTextContent("United Kingdom");
    expect(screen.getByTestId("vat-number")).toHaveTextContent("GB123123123");
  });
});
