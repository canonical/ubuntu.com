import React from "react";
import { render, screen } from "@testing-library/react";
import { add, format } from "date-fns";
import Summary from "./Summary";
import * as usePreview from "../../hooks/usePreview";
import * as utils from "../../utils/utils";

import { product, preview } from "../../utils/test/Mocks";
import { Periods, Support } from "../../utils/utils";
import { FormProvider } from "../../utils/FormContext";
import { QueryClient, QueryClientProvider } from "react-query";

const DATE_FORMAT = "dd MMMM yyyy";

describe("Summary", () => {
  let queryClient;

  beforeEach(async () => {
    queryClient = new QueryClient();
  });

  beforeAll(() => {
    Object.defineProperty(window, "productList", {
      value: {
        "uaia-essential-physical-yearly": {
          ...product,
          price: { value: 10000 },
        },
        "uaia-essential-physical-monthly": {
          ...product,
          id: "uaia-essential-physical-monthly",
          period: "monthly",
        },
      },
    });
  });

  it("renders correctly with no preview", () => {
    jest.spyOn(usePreview, "default").mockImplementation(() => {
      return { data: null };
    });

    render(
      <QueryClientProvider client={queryClient}>
        <FormProvider initialSupport={Support.none} initialQuantity={3}>
          <Summary />
        </FormProvider>
      </QueryClientProvider>
    );

    expect(screen.getByText("Ubuntu Pro")).toBeInTheDocument();
    expect(screen.getByText("3 x $100.00")).toBeInTheDocument();
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

    expect(screen.getByTestId("subtotal")).toHaveTextContent("$300.00");
  });

  it("renders correctly with no preview and a monthly product", () => {
    jest.spyOn(usePreview, "default").mockImplementation(() => {
      return { data: null };
    });
    jest.spyOn(utils, "isMonthlyAvailable").mockImplementation(() => {
      return true;
    });

    render(
      <QueryClientProvider client={queryClient}>
        <FormProvider
          initialSupport={Support.essential}
          initialQuantity={3}
          initialPeriod={Periods.monthly}
        >
          <Summary />
        </FormProvider>
      </QueryClientProvider>
    );

    expect(screen.getByText("Ubuntu Pro")).toBeInTheDocument();

    expect(screen.getByTestId("start-date")).toHaveTextContent(
      format(new Date(), DATE_FORMAT)
    );
    expect(screen.getByTestId("end-date")).toHaveTextContent(
      format(
        add(new Date(), {
          months: 1,
        }),
        DATE_FORMAT
      )
    );
  });

  it("renders correctly with a preview with tax amount", () => {
    jest.spyOn(usePreview, "default").mockImplementation(() => {
      return {
        data: {
          ...preview,
          taxAmount: 99999,
          total: 12345,
          subscriptionEndOfCycle: null,
        },
      };
    });
    render(
      <QueryClientProvider client={queryClient}>
        <FormProvider initialSupport={Support.essential}>
          <Summary />
        </FormProvider>
      </QueryClientProvider>
    );

    expect(screen.getByTestId("tax")).toHaveTextContent("$999.99");
    expect(screen.getByTestId("total")).toHaveTextContent("$123.45");
  });

  it("renders correctly with a preview with a different end of cycle", () => {
    jest.spyOn(usePreview, "default").mockImplementation(() => {
      return {
        data: {
          ...preview,
          taxAmount: 10000,
          total: 30000,
          subscriptionEndOfCycle: "2042-02-03T16:32:54Z",
        },
      };
    });
    render(
      <QueryClientProvider client={queryClient}>
        <FormProvider initialSupport={Support.essential}>
          <Summary />
        </FormProvider>
      </QueryClientProvider>
    );

    expect(screen.getByTestId("for-this-period")).toHaveTextContent("$200.00");
    expect(screen.getByTestId("end-date")).toHaveTextContent(
      "03 February 2042"
    );
  });
});
