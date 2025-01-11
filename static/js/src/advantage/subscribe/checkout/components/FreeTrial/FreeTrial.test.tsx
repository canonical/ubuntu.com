import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { add, format } from "date-fns";
import { Formik } from "formik";
import { render, screen } from "@testing-library/react";
import { taxes } from "advantage/subscribe/react/utils/test/Mocks";
import { formatter } from "advantage/subscribe/react/utils/utils";
import FreeTrial from "./FreeTrial";
import { UAProduct } from "../../utils/test/Mocks";

describe("FreeTrial", () => {
  let queryClient: QueryClient;

  beforeEach(async () => {
    queryClient = new QueryClient();
  });

  it("displays a message explaining the trial if free trial is selected", () => {
    queryClient.setQueryData(["calculate"], taxes);
    const products = [
      {
        product: UAProduct,
        quantity: 1,
      },
    ];
    render(
      <QueryClientProvider client={queryClient}>
        <Formik
          initialValues={{ FreeTrial: "useFreeTrial" }}
          onSubmit={jest.fn()}
        >
          <FreeTrial products={products} action={"purchase"} />
        </Formik>
      </QueryClientProvider>,
    );
    screen.getByText("Your free trial ends:");
    screen.getByText(
      `${format(
        add(new Date(), {
          months: 1,
        }),
        "dd MMMM yyyy",
      )} after which time you will be charged ${formatter.format(
        taxes.total / 100,
      )}.`,
    );
  });

  it("does not display the message if pay now is selected", () => {
    const products = [
      {
        product: UAProduct,
        quantity: 1,
      },
    ];
    render(
      <QueryClientProvider client={queryClient}>
        <Formik initialValues={{}} onSubmit={jest.fn()}>
          <FreeTrial products={products} action={"purchase"} />
        </Formik>
      </QueryClientProvider>,
    );
    expect(screen.queryByText("Your free trial ends:")).not.toBeInTheDocument();
  });
});
