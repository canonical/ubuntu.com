import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { FormProvider } from "advantage/subscribe/react/utils/FormContext";
import Support from "./Support";
import {
  Features,
  LTSVersions,
  ProductListings,
  ProductTypes,
  Support as SupportEnum,
} from "advantage/subscribe/react/utils/utils";
import { productListFixture } from "advantage/subscribe/react/utils/test/Mocks";

beforeAll(() => {
  global.window.productList = productListFixture as ProductListings;
});

test("Support section displays the correct price for physical product", () => {
  render(
    <FormProvider initialSupport={SupportEnum.essential}>
      <Support />
    </FormProvider>
  );
  screen.getByText("+$525.00 per machine per year");
});

test("Support section displays the correct price for virtual product", () => {
  render(
    <FormProvider
      initialSupport={SupportEnum.essential}
      initialType={ProductTypes.virtual}
    >
      <Support />
    </FormProvider>
  );
  screen.getByText("+$175.00 per machine per year");
});

test("Standard and advanced support are disabled if an older LTS is selected", () => {
  render(
    <FormProvider initialVersion={LTSVersions.xenial}>
      <Support />
    </FormProvider>
  );
  expect(screen.getByTestId("standard")).toHaveClass("u-disable");
  expect(screen.getByTestId("advanced")).toHaveClass("u-disable");
});

test("Standard and advanced support are disabled destkop and Apps are selected", () => {
  render(
    <FormProvider
      initialType={ProductTypes.desktop}
      initialFeature={Features.apps}
    >
      <Support />
    </FormProvider>
  );
  expect(screen.getByTestId("standard")).toHaveClass("u-disable");
  expect(screen.getByTestId("advanced")).toHaveClass("u-disable");
});

test("The section is disabled if a public cloud is selected", () => {
  render(
    <FormProvider initialType={ProductTypes.aws}>
      <Support />
    </FormProvider>
  );

  expect(screen.getByTestId("wrapper")).toHaveClass("u-disable");
});
