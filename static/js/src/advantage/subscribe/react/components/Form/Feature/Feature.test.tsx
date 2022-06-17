import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { FormProvider } from "advantage/subscribe/react/utils/FormContext";
import Feature from "./Feature";
import {
  ProductListings,
  ProductTypes,
} from "advantage/subscribe/react/utils/utils";
import { productListFixture } from "advantage/subscribe/react/utils/test/Mocks";

beforeAll(() => {
  global.window.productList = productListFixture as ProductListings;
});

test("Feature section renders correctly", () => {
  render(
    <FormProvider>
      <Feature />
    </FormProvider>
  );

  screen.getByText("Select Infra only");
  screen.getByText("Select Apps only");
  screen.getByText("Select Infra + Apps");
});

test("Feature sections disables Infra + Apps if destkop is selected", () => {
  render(
    <FormProvider initialType={ProductTypes.desktop}>
      <Feature />
    </FormProvider>
  );

  expect(document.getElementsByClassName("u-disable")).toHaveLength(1);
});

test("The section is disabled if a public cloud is selected", () => {
  render(
    <FormProvider initialType={ProductTypes.aws}>
      <Feature />
    </FormProvider>
  );

  expect(document.getElementsByClassName("u-disable")).toHaveLength(1);
});
