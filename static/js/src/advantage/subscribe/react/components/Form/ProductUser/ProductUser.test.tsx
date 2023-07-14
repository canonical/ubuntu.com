import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import userEvent from "@testing-library/user-event";
import { FormProvider } from "advantage/subscribe/react/utils/FormContext";
import ProductUser from "./ProductUser";
import { ProductListings } from "advantage/subscribe/react/utils/utils";
import { productListFixture } from "advantage/subscribe/react/utils/test/Mocks";

beforeAll(() => {
  global.window.productList = productListFixture as ProductListings;
});

test("Should not display step 2,3,4,5,6 when 'myself' is selected in the first step", async () => {
  render(
    <FormProvider>
      <ProductUser />
    </FormProvider>
  );

  await userEvent.click(screen.getByText("Myself"));

  expect(screen.queryByText(/What are you setting up/)).not.toBeInTheDocument();
  expect(screen.queryByText(/For how many machines/)).not.toBeInTheDocument();
  expect(
    screen.queryByText(/What Ubuntu LTS version are you running/)
  ).not.toBeInTheDocument();
  expect(
    screen.queryByText(/What security coverage do you need/)
  ).not.toBeInTheDocument();
  expect(
    screen.queryByText(/Do you also need phone and ticket support/)
  ).not.toBeInTheDocument();
});
