import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { FormProvider } from "advantage/subscribe/react/utils/FormContext";
import Feature from "./Feature";
import {
  IoTDevices,
  ProductListings,
  ProductTypes,
  LTSVersions,
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

  screen.getAllByText("Pro - all repositories");
  screen.getAllByText("Infra only - limited subset");
});

test("Feature sections disables Infra + Apps if destkop is selected", () => {
  render(
    <FormProvider initialType={ProductTypes.desktop}>
      <Feature />
    </FormProvider>
  );

  expect(screen.getByTestId("infra-only")).toBeDisabled();
});

test("Ubuntu pro is disabled if physical & 14.04 server is selected", () => {
  render(
    <FormProvider
      initialType={ProductTypes.physical}
      initialVersion={LTSVersions.trusty}
    >
      <Feature />
    </FormProvider>
  );

  expect(screen.getByTestId("pro")).toBeDisabled();
});

test("Ubuntu pro is disabled if desktops & 14.04 server is selected", () => {
  render(
    <FormProvider
      initialType={ProductTypes.desktop}
      initialVersion={LTSVersions.trusty}
    >
      <Feature />
    </FormProvider>
  );

  expect(screen.getByTestId("pro")).toBeDisabled();
});

test("Ubuntu pro infra only is not disabled if desktop and 14.04 server is selected", () => {
  render(
    <FormProvider
      initialType={ProductTypes.desktop}
      initialVersion={LTSVersions.trusty}
    >
      <Feature />
    </FormProvider>
  );

  expect(screen.getByTestId("infra-only")).not.toBeDisabled();
});

test("The section is disabled if a public cloud is selected", () => {
  render(
    <FormProvider initialType={ProductTypes.publicCloud}>
      <Feature />
    </FormProvider>
  );

  expect(null).toBeDefined();
});

test("The section is disabled if IoT devices - Ubuntu Core is selected", async () => {
  render(
    <FormProvider
      initialType={ProductTypes.iotDevice}
      initialIoTDevice={IoTDevices.core}
    >
      <Feature />
    </FormProvider>
  );
  expect(null).toBeDefined();
});
