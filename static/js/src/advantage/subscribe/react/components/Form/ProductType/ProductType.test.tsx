import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import userEvent from "@testing-library/user-event";
import { FormProvider } from "advantage/subscribe/react/utils/FormContext";
import ProductType from "./ProductType";
import { ProductListings } from "advantage/subscribe/react/utils/utils";
import { productListFixture } from "advantage/subscribe/react/utils/test/Mocks";

beforeAll(() => {
  global.window.productList = productListFixture as ProductListings;
});

test("Type selector doesn't display the public cloud section by default", () => {
  render(
    <FormProvider>
      <ProductType />
    </FormProvider>
  );

  expect(screen.queryByText(/^You can buy/)).not.toBeInTheDocument();
});

test("Type selector displays the public cloud section if a public cloud is selected", async () => {
  render(
    <FormProvider>
      <ProductType />
    </FormProvider>
  );

  await userEvent.click(screen.getByText("AWS instances"));

  expect(
    screen.getByText(/^Ubuntu Pro on the AWS Marketplace/)
  ).toHaveAttribute(
    "href",
    "https://aws.amazon.com/marketplace/search/results?page=1&filters=VendorId&VendorId=e6a5002c-6dd0-4d1e-8196-0a1d1857229b&searchTerms=ubuntu+pro"
  );
});
