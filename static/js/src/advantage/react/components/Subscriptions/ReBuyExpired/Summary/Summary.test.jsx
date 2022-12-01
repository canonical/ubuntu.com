import React from "react";
import { render, screen } from "@testing-library/react";
import { add, format } from "date-fns";

import { product, preview } from "advantage/subscribe/react/utils/test/Mocks";
import * as usePreview from "advantage/subscribe/react/hooks/usePreview";
import Summary from "./Summary";

const DATE_FORMAT = "dd MMMM yyyy";

describe("Summary", () => {
  it("renders correctly with no preview", () => {
    jest.spyOn(usePreview, "default").mockImplementation(() => {
      return { data: null };
    });

    render(<Summary quantity={3} product={product} />);

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
        data: {
          ...preview,
          taxAmount: 99999,
          total: 12345,
          subscriptionEndOfCycle: null,
        },
      };
    });

    render(<Summary quantity={3} product={product} />);

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

    render(<Summary quantity={3} product={product} />);

    expect(screen.getByTestId("for-this-period")).toHaveTextContent("$200.00");
    expect(screen.getByTestId("end-date")).toHaveTextContent(
      "03 February 2042"
    );
  });
});
