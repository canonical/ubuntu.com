import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
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
  expect(
    screen.queryByText(/^Solutions for Ubuntu 18.04 LTS instances/)
  ).not.toBeInTheDocument();
});

test("Type selector displays the public cloud section if a public cloud is selected", async () => {
  render(
    <FormProvider>
      <ProductType />
    </FormProvider>
  );

  await userEvent.click(screen.getByText("Public cloud instances"));

  expect(
    screen.getByText(/launch new Ubuntu Pro instances on the AWS Marketplace/)
  ).toHaveAttribute(
    "href",
    "https://aws.amazon.com/marketplace/search/results?page=1&filters=VendorId&VendorId=e6a5002c-6dd0-4d1e-8196-0a1d1857229b&searchTerms=ubuntu+pro+ec2"
  );
});

test("2 tabs display when IoT devices is selected", () => {
  render(
    <FormProvider>
      <ProductType />
    </FormProvider>
  );
  userEvent.click(screen.getByText("IoT and devices"));
  expect(screen.findByText("Ubuntu Classic"));
  expect(screen.findByText("Ubuntu Core"));
});

test("A button displays when Ubuntu Core is selected", () => {
  render(
    <FormProvider>
      <ProductType />
    </FormProvider>
  );
  userEvent.click(screen.getByText("IoT and devices"));
  const tab = screen.getByText("Ubuntu Core");
  fireEvent.click(tab);
  expect(screen.findByText("Learn more about Ubuntu Core"));
});
