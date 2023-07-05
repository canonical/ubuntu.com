import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import userEvent from "@testing-library/user-event";
import { FormProvider } from "advantage/subscribe/react/utils/FormContext";
import ProductSummary from "./ProductSummary";
import { ProductListings } from "advantage/subscribe/react/utils/utils";
import { productListFixture } from "advantage/subscribe/react/utils/test/Mocks";
import ProductUser from "../Form/ProductUser/ProductUser";

beforeAll(() => {
  global.window.productList = productListFixture as ProductListings;
});

test("Should show register button and person subscription terms of service when 'myself' is selected ", async () => {
  render(
    <FormProvider>
      <ProductUser />
      <ProductSummary />
    </FormProvider>
  );

  await userEvent.click(screen.getByText("Myself"));

  expect(screen.getByTestId("personal-subscription")).toHaveAttribute(
    "href",
    "/legal/ubuntu-pro/personal"
  );
  expect(screen.getAllByText("Register")[0]).toBeInTheDocument();
});
