import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Formik } from "formik";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { DistributorProduct, UAProduct } from "../../utils/test/Mocks";
import Taxes from "./Taxes";
import userEvent from "@testing-library/user-event";
import { UserSubscriptionMarketplace } from "advantage/api/enum";

describe("TaxesTests", () => {
  let queryClient: QueryClient;
  const stripePromise = loadStripe(window.stripePublishableKey ?? "");

  beforeEach(async () => {
    queryClient = new QueryClient();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("renders country select correctly", () => {
    const products = [
      {
        product: UAProduct,
        quantity: 1,
      },
    ];
    render(
      <QueryClientProvider client={queryClient}>
        <Formik initialValues={{}} onSubmit={jest.fn()}>
          <Elements stripe={stripePromise}>
            <Taxes products={products} setError={jest.fn()} />
          </Elements>
        </Formik>
      </QueryClientProvider>,
    );
    screen.getByText("Country/Region:");
    expect(screen.getByTestId("select-country")).toBeInTheDocument();
    screen.getByRole("button", { name: "Save" });
  });

  it("When non VAT Country is selected, VAT Number input does not displays", () => {
    const products = [
      {
        product: UAProduct,
        quantity: 1,
      },
    ];
    render(
      <QueryClientProvider client={queryClient}>
        <Formik initialValues={{}} onSubmit={jest.fn()}>
          <Elements stripe={stripePromise}>
            <Taxes products={products} setError={jest.fn()} />
          </Elements>
        </Formik>
      </QueryClientProvider>,
    );

    expect(screen.getByTestId("select-country")).toBeInTheDocument();
    fireEvent.change(screen.getByTestId("select-country"), {
      target: { value: "JP" },
    });
  });

  it("When VAT country is selected, VAT Number input displays", () => {
    const products = [
      {
        product: UAProduct,
        quantity: 1,
      },
    ];
    render(
      <QueryClientProvider client={queryClient}>
        <Formik initialValues={{}} onSubmit={jest.fn()}>
          <Elements stripe={stripePromise}>
            <Taxes products={products} setError={jest.fn()} />
          </Elements>
        </Formik>
      </QueryClientProvider>,
    );

    expect(screen.getByTestId("select-country")).toBeInTheDocument();
    fireEvent.change(screen.getByTestId("select-country"), {
      target: { value: "FR" },
    });

    expect(screen.getByText("VAT number:")).toBeInTheDocument();
  });

  it("When USA is selected, State select displays", () => {
    const products = [
      {
        product: UAProduct,
        quantity: 1,
      },
    ];
    const { getByTestId } = render(
      <QueryClientProvider client={queryClient}>
        <Formik initialValues={{}} onSubmit={jest.fn()}>
          <Elements stripe={stripePromise}>
            <Taxes products={products} setError={jest.fn()} />
          </Elements>
        </Formik>
      </QueryClientProvider>,
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

    const initialValues = {
      country: "GB",
    };
    const products = [
      {
        product: UAProduct,
        quantity: 1,
      },
    ];
    render(
      <QueryClientProvider client={queryClient}>
        <Formik initialValues={initialValues} onSubmit={jest.fn()}>
          <Elements stripe={stripePromise}>
            <Taxes products={products} setError={jest.fn()} />
          </Elements>
        </Formik>
      </QueryClientProvider>,
    );

    expect(screen.getByRole("button", { name: "Edit" })).toBeInTheDocument();
  });

  it("sets status right if country is not stored", () => {
    const products = [
      {
        product: UAProduct,
        quantity: 1,
      },
    ];
    render(
      <QueryClientProvider client={queryClient}>
        <Formik initialValues={{}} onSubmit={jest.fn()}>
          <Elements stripe={stripePromise}>
            <Taxes products={products} setError={jest.fn()} />
          </Elements>
        </Formik>
      </QueryClientProvider>,
    );

    expect(screen.getByRole("button", { name: "Save" })).toBeInTheDocument();
  });

  it("cancel button resets tax step values", () => {
    global.window = Object.create(window);
    Object.defineProperty(window, "accountId", { value: "ABCDEF" });

    const initialValues = {
      country: "GB",
      VATNumber: "GB123123123",
    };

    const products = [
      {
        product: UAProduct,
        quantity: 1,
      },
    ];
    render(
      <QueryClientProvider client={queryClient}>
        <Formik initialValues={initialValues} onSubmit={jest.fn()}>
          <Elements stripe={stripePromise}>
            <Taxes products={products} setError={jest.fn()} />
          </Elements>
        </Formik>
      </QueryClientProvider>,
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

  it("Edit should be available for pro users", async () => {
    global.window = Object.create(window);
    Object.defineProperty(window, "accountId", { value: "ABCDEF" });

    const initialValues = {
      country: "GB",
      VATNumber: "GB123123123",
      marketPlace: "canonical-ua",
    };

    const products = [
      {
        product: UAProduct,
        quantity: 1,
      },
    ];
    render(
      <QueryClientProvider client={queryClient}>
        <Formik initialValues={initialValues} onSubmit={jest.fn()}>
          <Elements stripe={stripePromise}>
            <Taxes products={products} setError={jest.fn()} />
          </Elements>
        </Formik>
      </QueryClientProvider>,
    );

    expect(screen.queryByRole("button", { name: "Edit" })).toBeInTheDocument();
    userEvent.click(screen.getByRole("button", { name: "Edit" }));
    await waitFor(() => {
      expect(screen.getByTestId("select-country")).toBeInTheDocument();
      expect(screen.getByTestId("field-vat-number")).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "Save" })).toBeInTheDocument();
    });
  });

  it("Edit button should not be displayed for channel users", () => {
    global.window = Object.create(window);
    Object.defineProperty(window, "accountId", { value: "ABCDEF" });
    const initialValues = {
      country: "GB",
      VATNumber: "GB123123123",
      marketPlace: UserSubscriptionMarketplace.CanonicalProChannel,
    };
    const products = [
      {
        product: DistributorProduct,
        quantity: 1,
      },
    ];
    render(
      <QueryClientProvider client={queryClient}>
        <Formik initialValues={initialValues} onSubmit={jest.fn()}>
          <Elements stripe={stripePromise}>
            <Taxes products={products} setError={jest.fn()} />
          </Elements>
        </Formik>
      </QueryClientProvider>,
    );

    expect(screen.queryByTestId("tax-edit-button")).toBeInTheDocument();
  });

  it("New channel users should be able to add their tax info", async () => {
    global.window = Object.create(window);
    Object.defineProperty(window, "accountId", { value: "ABCDEF" });

    const initialValues = {
      country: "",
      VATNumber: "",
      marketPlace: UserSubscriptionMarketplace.CanonicalProChannel,
    };

    const products = [
      {
        product: DistributorProduct,
        quantity: 1,
      },
    ];
    render(
      <QueryClientProvider client={queryClient}>
        <Formik initialValues={initialValues} onSubmit={jest.fn()}>
          <Elements stripe={stripePromise}>
            <Taxes products={products} setError={jest.fn()} />
          </Elements>
        </Formik>
      </QueryClientProvider>,
    );

    expect(screen.queryByTestId("tax-edit-button")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Save" })).toBeInTheDocument();
  });
});
