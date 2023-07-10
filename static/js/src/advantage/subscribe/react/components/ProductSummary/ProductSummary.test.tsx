import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { FormProvider } from "advantage/subscribe/react/utils/FormContext";
import ProductSummary from "./ProductSummary";
import {
  ProductListings,
  ProductTypes,
  ProductUsers,
} from "advantage/subscribe/react/utils/utils";
import { productListFixture } from "advantage/subscribe/react/utils/test/Mocks";

beforeAll(() => {
  global.window.productList = productListFixture as ProductListings;
});

test("Should show Buy now button and full service description link when 'organisation' is selected ", async () => {
  render(
    <FormProvider initialUser={ProductUsers.organisation}>
      <ProductSummary />
    </FormProvider>
  );

  expect(
    screen.getAllByText("See full service description")[0]
  ).toHaveAttribute("href", "/legal/ubuntu-pro-description");
  expect(screen.getAllByText("Buy now")[0]).toBeInTheDocument();
});

test("Should show register button and person subscription terms of service when 'myself' is selected ", async () => {
  render(
    <FormProvider initialUser={ProductUsers.myself}>
      <ProductSummary />
    </FormProvider>
  );

  expect(screen.getByTestId("personal-subscription")).toHaveAttribute(
    "href",
    "/legal/ubuntu-pro/personal"
  );
  expect(screen.getAllByText("Register")[0]).toBeInTheDocument();
});

test("Type selector displays the public cloud section if a public cloud is selected", async () => {
  render(
    <FormProvider
      initialUser={ProductUsers.organisation}
      initialType={ProductTypes.publicCloud}
    >
      <ProductSummary />
    </FormProvider>
  );
  expect(screen.getByTestId("summary-section")).toHaveClass(
    "p-shop-cart--hidden"
  );
});
