import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import userEvent from "@testing-library/user-event";
import { FormProvider } from "advantage/subscribe/react/utils/FormContext";
import Version from "./Version";
import {
  LTSVersions,
  ProductListings,
  ProductTypes,
} from "advantage/subscribe/react/utils/utils";
import { productListFixture } from "advantage/subscribe/react/utils/test/Mocks";

beforeAll(() => {
  global.window.productList = productListFixture as ProductListings;
});

test("Version section displays the matching features to the selected version", async () => {
  render(
    <FormProvider initialVersion={LTSVersions.jammy}>
      <Version />
    </FormProvider>
  );
  expect(screen.getByText(/^For Ubuntu 22.04, all UA plans include/));

  await userEvent.click(screen.getByText("Ubuntu 16.04 LTS"));
  expect(screen.getByText(/^For Ubuntu 16.04, all UA plans include/));
});

test("It opens the modal if 'other versions' is clicked", async () => {
  render(
    <FormProvider>
      <Version />
    </FormProvider>
  );
  await userEvent.click(screen.getByText("Are you using an older version?"));
  expect(screen.getByText(/^Other versions?/)).toBeInTheDocument();
});

test("The section is disabled if a public cloud is selected", () => {
  render(
    <FormProvider initialType={ProductTypes.publicCloud}>
      <Version />
    </FormProvider>
  );

  expect(screen.getByTestId("wrapper")).toHaveClass("u-disable");
});
