import React from "react";
import { QueryClient, QueryClientProvider } from "react-query";
import { Formik } from "formik";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { fireEvent, render, screen } from "@testing-library/react";
import * as useCustomerInfo from "../../hooks/useCustomerInfo";
import { UAProduct } from "../../utils/test/Mocks";
import Taxes from "./Taxes";

describe("PaymentMethodSummary", () => {
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
              setIsSummaryLoading={jest.fn()}
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
              setIsSummaryLoading={jest.fn()}
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
              setIsSummaryLoading={jest.fn()}
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
              setIsSummaryLoading={jest.fn()}
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
    jest.spyOn(useCustomerInfo, "default").mockImplementation(() => {
      return {
        isLoading: false,
        data: {
          customerInfo: {
            address: {
              country: "GB",
            },
          },
        },
        isError: false,
        isSuccess: true,
        error: undefined,
      };
    });

    render(
      <QueryClientProvider client={queryClient}>
        <Formik initialValues={{}} onSubmit={jest.fn()}>
          <Elements stripe={stripePromise}>
            <Taxes
              product={UAProduct}
              quantity={1}
              setError={jest.fn()}
              setTaxSaved={jest.fn()}
              setIsSummaryLoading={jest.fn()}
            />
          </Elements>
        </Formik>
      </QueryClientProvider>
    );

    expect(screen.getByRole("button", { name: "Edit" })).toBeInTheDocument();
  });

  it("sets status right if country is not stored", () => {
    jest.spyOn(useCustomerInfo, "default").mockImplementation(() => {
      return {
        isLoading: false,
        data: undefined,
        isError: false,
        isSuccess: true,
        error: undefined,
      };
    });

    render(
      <QueryClientProvider client={queryClient}>
        <Formik initialValues={{}} onSubmit={jest.fn()}>
          <Elements stripe={stripePromise}>
            <Taxes
              product={UAProduct}
              quantity={1}
              setError={jest.fn()}
              setTaxSaved={jest.fn()}
              setIsSummaryLoading={jest.fn()}
            />
          </Elements>
        </Formik>
      </QueryClientProvider>
    );

    expect(screen.getByRole("button", { name: "Save" })).toBeInTheDocument();
  });
});
