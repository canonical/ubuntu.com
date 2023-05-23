import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { FormProvider } from "advantage/subscribe/react/utils/FormContext";
import Support from "./Support";
import {
  LTSVersions,
  ProductListings,
  ProductTypes,
  Features,
  IoTDevices,
} from "advantage/subscribe/react/utils/utils";
import { productListFixture } from "advantage/subscribe/react/utils/test/Mocks";

beforeAll(() => {
  global.window.productList = productListFixture as ProductListings;
});

test("Full support is disabled if Infra is selected", () => {
  render(
    <FormProvider initialFeature={Features.infra}>
      <Support />
    </FormProvider>
  );

  expect(screen.getByTestId("infra-support")).not.toBeDisabled();
  expect(screen.getByTestId("full-support")).toBeDisabled();
});

test("Infra support is disabled if desktop is selected", () => {
  render(
    <FormProvider initialType={ProductTypes.desktop}>
      <Support />
    </FormProvider>
  );

  expect(screen.getByTestId("infra-support")).toBeDisabled();
  expect(screen.getByTestId("full-support")).not.toBeDisabled();
});

test("Infra and full support are disabled if Trusty is selected", () => {
  render(
    <FormProvider initialVersion={LTSVersions.trusty}>
      <Support />
    </FormProvider>
  );

  expect(screen.getByTestId("infra-support")).toBeDisabled();
  expect(screen.getByTestId("full-support")).toBeDisabled();
});

test("Infra and full support are disabled if Xenial is selected", () => {
  render(
    <FormProvider initialVersion={LTSVersions.xenial}>
      <Support />
    </FormProvider>
  );

  expect(screen.getByTestId("infra-support")).toBeDisabled();
  expect(screen.getByTestId("full-support")).toBeDisabled();
});

test("The section is disabled if a public cloud is selected", () => {
  render(
    <FormProvider initialType={ProductTypes.publicCloud}>
      <Support />
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
      <Support />
    </FormProvider>
  );
  expect(null).toBeDefined();
});
