import React from "react";
import { QueryClient, QueryClientProvider } from "react-query";
import { add, format } from "date-fns";
import { Formik } from "formik";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { render, screen } from "@testing-library/react";
import * as useCalculate from "../../hooks/useCalculate";
import * as usePreview from "../../hooks/usePreview";
import { taxInfo, UAProduct } from "../../utils/test/Mocks";
import Summary from "./Summary";

const DATE_FORMAT = "dd MMMM yyyy";

describe("Summary", () => {
  let queryClient: QueryClient;
  const stripePromise = loadStripe(window.stripePublishableKey ?? "");

  beforeEach(async () => {
    queryClient = new QueryClient();
  });

  beforeAll(() => {
    Object.defineProperty(window, "productList", {
      value: {
        "uaia-essential-physical-yearly": {
          ...UAProduct,
          price: { value: 10000 },
        },
        "uaia-essential-physical-monthly": {
          ...UAProduct,
          id: "uaia-essential-physical-monthly",
          period: "monthly",
        },
      },
    });
  });

  it("renders correctly with no preview", () => {
    jest.spyOn(usePreview, "default").mockImplementation(() => {
      return {
        isLoading: false,
        data: undefined,
        isError: false,
        isSuccess: true,
        error: undefined,
        isFetching: false,
      };
    });

    jest.spyOn(useCalculate, "default").mockImplementation(() => {
      return {
        isLoading: false,
        data: undefined,
        isError: false,
        isSuccess: true,
        error: undefined,
        isFetching: false,
      };
    });

    render(
      <QueryClientProvider client={queryClient}>
        <Formik initialValues={{}} onSubmit={jest.fn()}>
          <Elements stripe={stripePromise}>
            <Summary quantity={3} product={UAProduct} action={"purchase"} />
          </Elements>
        </Formik>
      </QueryClientProvider>
    );

    expect(screen.getByText("Ubuntu Pro")).toBeInTheDocument();
    expect(screen.getByText("3 x $500.00")).toBeInTheDocument();
    expect(screen.getByTestId("start-date")).toHaveTextContent(
      format(new Date(), DATE_FORMAT)
    );
    expect(screen.getByTestId("end-date")).toHaveTextContent(
      format(
        add(new Date(), {
          years: 1,
        }),
        DATE_FORMAT
      )
    );

    expect(screen.getByTestId("subtotal")).toHaveTextContent("$1,500.00");
  });

  it("renders correctly with a preview with tax amount", () => {
    jest.spyOn(usePreview, "default").mockImplementation(() => {
      return {
        isLoading: false,
        data: {
          ...taxInfo,
          tax: 999,
          total: 12345,
        },
        isError: false,
        isSuccess: true,
        error: undefined,
        isFetching: false,
      };
    });
    render(
      <QueryClientProvider client={queryClient}>
        <Formik initialValues={{}} onSubmit={jest.fn()}>
          <Elements stripe={stripePromise}>
            <Summary quantity={3} product={UAProduct} action={"purchase"} />
          </Elements>
        </Formik>
      </QueryClientProvider>
    );

    expect(screen.getByTestId("tax")).toHaveTextContent("$9.99");
    expect(screen.getByTestId("total")).toHaveTextContent("$123.45");
  });

  it("renders correctly with a preview with a different end of cycle", () => {
    jest.spyOn(usePreview, "default").mockImplementation(() => {
      return {
        isLoading: true,
        data: {
          ...taxInfo,
          tax: 10000,
          total: 30000,
          end_of_cycle: "2042-02-03T16:32:54Z",
        },
        isError: false,
        isSuccess: true,
        error: undefined,
        isFetching: false,
      };
    });
    render(
      <QueryClientProvider client={queryClient}>
        <Formik initialValues={{}} onSubmit={jest.fn()}>
          <Elements stripe={stripePromise}>
            <Summary quantity={3} product={UAProduct} action={"purchase"} />
          </Elements>
        </Formik>
      </QueryClientProvider>
    );

    expect(screen.getByTestId("for-this-period")).toHaveTextContent("$200.00");
    expect(screen.getByTestId("end-date")).toHaveTextContent(
      "03 February 2042"
    );
  });
});
