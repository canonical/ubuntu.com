import React from "react";
import { render, screen } from "@testing-library/react";
import { add, format } from "date-fns";
import Summary from "./Summary";
import * as usePreview from "advantage/subscribe/react/hooks/usePreview";

import { product, preview } from "advantage/subscribe/react/utils/test/Mocks";
import { Periods, Support } from "advantage/subscribe/react/utils/utils";
import { FormProvider } from "../../utils/FormContext";

const DATE_FORMAT = "dd MMMM yyyy";

describe("Summary", () => {
  beforeAll(() => {
    Object.defineProperty(window, "blenderProductList", {
      value: {
        "blender-support-essential-yearly": {
          ...product,
          name: "Blender Support - Essential",
          price: { value: 10000 },
        },
        "blender-support-essential-monthly": {
          ...product,
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
      <FormProvider initialSupport={Support.essential} initialQuantity={3}>
        <Summary />
      </FormProvider>
    );

    expect(screen.getByText("Blender Support - Essential")).toBeInTheDocument();
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
    render(
      <FormProvider
        initialSupport={Support.essential}
        initialPeriod={Periods.monthly}
      >
        <Summary />
      </FormProvider>
    );

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
      <FormProvider initialSupport={Support.essential}>
        <Summary />
      </FormProvider>
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
      <FormProvider initialSupport={Support.essential}>
        <Summary />
      </FormProvider>
    );

    expect(screen.getByTestId("for-this-period")).toHaveTextContent("$200.00");
    expect(screen.getByTestId("end-date")).toHaveTextContent(
      "03 February 2042"
    );
  });
});
